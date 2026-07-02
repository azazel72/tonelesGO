class NativeBridge {

    async printZpl(zpl) {

        // APP REAL
        if (window.HybridWebView) {
            return await window.HybridWebView.InvokeDotNet(
                "PrintZpl",
                zpl
            );
        }

        // DESARROLLO WEB
        console.log("MOCK PRINT", zpl);

        return {
            success: true
        };
    }

    async scanBarcode() {

        if (window.HybridWebView) {
            return await window.HybridWebView.InvokeDotNet(
                "ScanBarcode"
            );
        }

        // navegador PC
        return prompt("Código simulado:");
    }
}

window.App = new NativeBridge();