/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = `fitlog-${version}`;

// Precache app shell + static files (exclude large videos to save storage)
const PRECACHE_ASSETS = [
	...build,
	...files.filter((f) => !f.includes('/exercises/videos/'))
];

// Install: precache app shell and images
sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_ASSETS))
			.then(() => sw.skipWaiting())
	);
});

// Activate: clean old caches
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
			)
			.then(() => sw.clients.claim())
	);
});

// Fetch strategy
sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Only handle same-origin requests
	if (url.origin !== sw.location.origin) return;

	// Skip non-GET requests
	if (event.request.method !== 'GET') return;

	// Navigation requests: network-first with offline fallback
	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request)
				.catch(() => caches.match(event.request))
				.then((r) => r || caches.match('/') || new Response('Offline', { status: 503 }))
		);
		return;
	}

	// Precached assets: cache-first
	if (PRECACHE_ASSETS.includes(url.pathname)) {
		event.respondWith(
			caches.match(event.request).then((cached) => cached || fetch(event.request))
		);
		return;
	}

	// Exercise videos: cache-on-demand (don't precache 38MB of videos)
	if (url.pathname.includes('/exercises/videos/')) {
		event.respondWith(
			caches.match(event.request).then((cached) => {
				if (cached) return cached;
				return fetch(event.request).then((response) => {
					if (response.ok) {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
					}
					return response;
				});
			})
		);
		return;
	}

	// Everything else: stale-while-revalidate
	event.respondWith(
		caches.match(event.request).then((cached) => {
			const fetchPromise = fetch(event.request)
				.then((response) => {
					if (response.ok) {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
					}
					return response;
				})
				.catch(() => cached || new Response('', { status: 503 }));

			return cached || fetchPromise;
		})
	);
});
