<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...$this->only([
                'id',
                'title',
                'slug',
                'excerpt',
                'body',
                'status',
                'publish_date',
                'featured_image_path',
                'user_id',
            ]),
            'featured_image_url' => $this->when($this->featured_image_path, fn () => Storage::url($this->featured_image_path)),
        ];
    }
}
