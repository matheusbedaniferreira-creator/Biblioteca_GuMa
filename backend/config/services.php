<?php
return [
    'supabase' => [
        'url' => env('SUPABASE_URL'),
        'publishable_key' => env('SUPABASE_PUBLISHABLE_KEY'),
    ],
    'google_books' => ['key' => env('GOOGLE_BOOKS_API_KEY', '')],
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
];
