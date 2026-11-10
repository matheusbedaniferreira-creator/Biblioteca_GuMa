<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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
        $parameters = [
            'q' => $query,
            'startIndex' => (int) ($data['start'] ?? 0),
            'maxResults' => 12,
            'printType' => 'books',
            'projection' => 'full',
            'langRestrict' => 'pt',
        ];
        if ($key = config('services.google_books.key')) $parameters['key'] = $key;
        try {
            // Fixed HTTPS host, never a user-supplied URL (avoids SSRF).
            $response = Http::timeout(8)->retry(2, 200)->acceptJson()
                ->get('https://www.googleapis.com/books/v1/volumes', $parameters);
            if (!$response->successful()) {
                return response()->json(['message' => 'Google Books indisponível no momento.'], 502);
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
            return response()->json(['total' => (int) $response->json('totalItems', 0), 'items' => $items]);
        } catch (ConnectionException $e) {
            return response()->json(['message' => 'Não foi possível conectar ao Google Books.'], 503);
        }
    }
}
