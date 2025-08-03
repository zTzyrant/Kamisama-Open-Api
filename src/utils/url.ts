import { URL } from 'url'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

export function getFullUrl(path: string): string {
	if (path.startsWith('http://') || path.startsWith('https://')) {
		return path
	}
	return new URL(path, BASE_URL).href
}
