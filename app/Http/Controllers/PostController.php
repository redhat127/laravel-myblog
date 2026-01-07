<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    public function all()
    {
        return inertia('post/all');
    }

    public function create()
    {
        return inertia('post/create');
    }

    public function store()
    {
        $validated = request()->validate([
            'title' => ['bail', 'required', 'string', 'min:10', 'max:100'],
            'excerpt' => ['bail', 'nullable', 'string', 'max:300'],
            'body' => ['bail', 'required', 'string', 'min:100', 'max:10000'],
            'status' => ['bail', 'required', 'string', Rule::in('draft', 'published', 'scheduled')],
            'publish_date' => [
                'bail',
                'nullable',
                'date',
                'after_or_equal:today',
                function ($attribute, $value, $fail) {
                    if (request()->input('status') === 'scheduled' && empty($value)) {
                        $fail('publish date is required when status is scheduled.');
                    }
                },
            ],
        ]);

        Auth::user()->posts()->create($validated);

        return redirect()->route('post.all')->with('flashMessage', [
            'type' => 'success',
            'text' => 'Post has been created.',
        ]);
    }
}
