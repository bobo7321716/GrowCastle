export enum HTTP_TYPE {
    GET = 'GET',
    POST = 'POST'
}

export enum HTTP_ERROR {
    TIME_OUT
}

export default class HttpManager {
    static send(url: string, params?: string, httpType?: HTTP_TYPE | string, timeout?: number): Promise<any>;
    static send(url: string, params?: object, httpType?: HTTP_TYPE | string, timeout?: number): Promise<any>;

    static send(url: string, params: any = null, httpType: HTTP_TYPE = HTTP_TYPE.GET, timeout: number = 5000000): Promise<any> {

        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (error) {
                            reject(xhr);
                        }
                    } else {
                        reject(xhr);
                    }
                    xhr && xhr.abort && xhr.abort();
                }
            };

            xhr.onerror = err => {
                console.log('request error', err);
                reject(HTTP_ERROR.TIME_OUT);
            };

            xhr.ontimeout = () => {
                reject(HTTP_ERROR.TIME_OUT);
                xhr && xhr.abort && xhr.abort();
            }

            if (params && typeof (params) == "object" && !params.length && !Array.isArray(params)) {
                params = JSON.stringify(params);
            }
            if (httpType == HTTP_TYPE.GET && params) {
                url += '?' + params;
                params = null;
            }
            xhr.open(httpType, url, true);
            xhr.timeout = timeout;

            if (httpType == HTTP_TYPE.POST) {
                xhr.setRequestHeader("Content-Type", 'application/json; charset=utf-8');
            }
            xhr.send(params);
            console.log(`[hs_game]Request URL:${url}`);
            console.log(`[hs_game]Request Data:${params}`);
        })
    }
}