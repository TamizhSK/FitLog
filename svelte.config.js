import adapterVercel from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';

const isCapacitor = process.env.CAPACITOR === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: isCapacitor
			? adapterStatic({ fallback: 'index.html' })
			: adapterVercel()
	}
};

export default config;
