/**
 * 取得產品清單 Service
 * 僅接收團型編號相關參數，不傳送 qkeyword
 */
export async function fetchProductList(params: {
    qmgrupcd?: string;
    qmgrupcds?: string;
}) {
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params), 
    });

    if (!response.ok) throw new Error('無法取得產品資料');
    return response.json();
}