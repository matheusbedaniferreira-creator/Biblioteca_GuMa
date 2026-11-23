<?php
return [
    'supabase' => [
        'url' => env('SUPABASE_URL'),
        'publishable_key' => env('SUPABASE_PUBLISHABLE_KEY'),
        'secret_key' => env('SUPABASE_SECRET_KEY'),
        'jwks_url' => env('SUPABASE_JWKS_URL'),
    ],
    'auth' => [
        'pepper' => env('PASSWORD_PEPPER', ''),
    ],
    'google_books' => ['key' => env('GOOGLE_BOOKS_API_KEY', '')],
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
];
