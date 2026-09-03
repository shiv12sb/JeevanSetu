package in.jeevansetu.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        bridgeBuilder.addWebViewListener(new WebViewListener() {
            @Override
            public void onReceivedError(WebView webView) {
                if (webView != null) {
                    webView.post(() -> {
                        WebSettings settings = webView.getSettings();
                        settings.setAllowFileAccess(true);
                        settings.setAllowContentAccess(true);
                        webView.loadUrl("file:///android_asset/public/index.html");
                    });
                }
            }
        });

        super.onCreate(savedInstanceState);

        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            WebSettings settings = webView.getSettings();
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
        }
    }
}
