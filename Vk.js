class VK {
    methodsBaseUrl = "https://api.vk.com/method/";
    apiVersion = "5.103";

    constructor ({appId, token}) {
        if (token) {
            this.token = token;
        } else {
            this.appId = appId;
            this.auth();
        }
    }

    call(methodName, params) {
        let url = new URL(this.methodsBaseUrl + methodName);
        for (let prop in params) {
            url.searchParams.set(prop, params[prop]);
        }
        url.searchParams.set("access_token", this.token);
        url.searchParams.set("v", this.apiVersion);

        let callbackFuncName = "vkResponse" + Math.floor(Math.random() * 1000);
        url.searchParams.set("callback", callbackFuncName);

        return new Promise(resolve => {
           let script = document.createElement("script");
           script.src = url.href;
           document.body.appendChild(script);

           window[callbackFuncName] = function(data) {
               resolve(data);
               document.body.removeChild(script);
           }
        });
    }

    auth() {
        let url = new URL("https://oauth.vk.com/authorize");
        url.searchParams.set("client_id", this.appId);
        url.searchParams.set("redirect_uri", location.origin);
        url.searchParams.set("display", "page");
        url.searchParams.set("scope", "friends");
        url.searchParams.set("response_type", "token");
        url.searchParams.set("v", this.apiVersion);
        location.href = url;
    }
}