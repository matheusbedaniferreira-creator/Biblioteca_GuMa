<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Client\ConnectionException;

/** Public Google Books discovery; intentionally separate from physical library inventory. */
final class GoogleBooksController
{
    public function search(Request $request)
    {
        $data = $request->validate([
            'q' => 'required|string|min:2|max:120',
            'start' => 'nullable|integer|min:0|max:900',
        ]);
        $query = trim($data['q']);
        $start = (int) ($data['start'] ?? 0);
        // Cache only public book metadata, never authentication credentials.
        $cacheKey = 'google_books:v1:'.hash('sha256', mb_strtolower($query, 'UTF-8').'|'.$start);
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return response()->json($cached);
        }

        $parameters = [
            'q' => $query,
            'startIndex' => $start,
            'maxResults' => 12,
            'printType' => 'books',
            'projection' => 'full',
            'langRestrict' => 'pt',
        ];
        if ($key = config('services.google_books.key')) $parameters['key'] = $key;
        try {
            // Fixed HTTPS host, never a user-supplied URL (avoids SSRF).
            $response = Http::timeout(10)->acceptJson()
                ->get('https://www.googleapis.com/books/v1/volumes', $parameters);
            if (!$response->successful()) {
                // Nao exponha o corpo da resposta remota: ele pode conter dados de infraestrutura.
                $status = $response->status();
                if ($status === 403) {
                    return response()->json(['message' => 'Google Books recusou a consulta (403). Confira a chave e a ativacao da API no Google Cloud, se estiver usando uma chave.'], 502);
                }
                if ($status === 429) {
                    return response()->json(['message' => 'Limite de consultas ao Google Books atingido. Tente novamente mais tarde.'], 503);
                }
                return response()->json(['message' => 'Google Books indisponivel no momento (HTTP '.$status.').'], 502);
            }
            $items = collect($response->json('items') ?? [])->map(function ($item) {
                $v = $item['volumeInfo'] ?? [];
                $links = $v['imageLinks'] ?? [];
                $url = $links['thumbnail'] ?? $links['smallThumbnail'] ?? null;
                // Proxy is not used: allow only HTTPS images from Google Books' configured domains.
                if ($url && str_starts_with($url, 'http://')) $url = 'https://'.substr($url, 7);
                if ($url && (!filter_var($url, FILTER_VALIDATE_URL) || !preg_match('~^https://(?:books\.google\.com|books\.googleusercontent\.com|[a-z0-9.-]*\.googleusercontent\.com)/~i', $url))) $url = null;
                return [
                    'google_id' => substr((string) ($item['id'] ?? ''), 0, 80),
                    'titulo' => mb_substr((string) ($v['title'] ?? 'Sem título'), 0, 150),
                    'autores' => array_slice(array_map(fn ($a) => mb_substr((string) $a, 0, 100), $v['authors'] ?? []), 0, 8),
                    'descricao' => mb_substr(strip_tags((string) ($v['description'] ?? '')), 0, 5000),
                    'imagem_capa_url' => $url,
                    'ano_publicacao' => isset($v['publishedDate']) && preg_match('/^(\d{4})/', $v['publishedDate'], $match) ? (int) $match[1] : null,
                    'editora' => mb_substr((string) ($v['publisher'] ?? ''), 0, 150),
                    'isbn' => collect($v['industryIdentifiers'] ?? [])->firstWhere('type', 'ISBN_13')['identifier'] ?? null,
                    'info_url' => isset($v['infoLink']) && str_starts_with($v['infoLink'], 'https://books.google.') ? $v['infoLink'] : null,
                ];
            })->values();
            $payload = ['total' => (int) $response->json('totalItems', 0), 'items' => $items];
            // Only successful results are cached. HTTP 429/403/5xx never poison the cache.
            Cache::put($cacheKey, $payload, now()->addHours(6));
            return response()->json($payload);
        } catch (ConnectionException $e) {
            report($e);
            return response()->json(['message' => 'Nao foi possivel conectar ao Google Books. Confira a rede do container Laravel.'], 503);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            // Defesa em profundidade caso o cliente HTTP lance uma excecao.
            report($e);
            return response()->json(['message' => 'Falha na resposta do Google Books (HTTP '.$e->response->status().').'], 502);
        }
    }
}
