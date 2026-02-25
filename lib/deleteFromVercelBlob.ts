// ✅ Client-side 可呼叫的安全封裝
export async function deleteFromVercelBlob(url: string) {
    try {
        await fetch('/api/upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
    } catch (err) {
        console.error('Failed to delete from Vercel Blob API route:', err);
        throw err;
    }
}
