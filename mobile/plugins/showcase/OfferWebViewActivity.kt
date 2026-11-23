package app.stash

import android.annotation.SuppressLint
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import org.json.JSONObject

class OfferWebViewActivity : AppCompatActivity() {
    private var web: WebView? = null
    private val navy = Color.rgb(7, 20, 38)
    private val textColor = Color.rgb(239, 246, 255)
    private val blue = Color.rgb(169, 214, 255)
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
    private fun label(value: String, size: Float = 16f) = TextView(this).apply {
        this.text = value; textSize = size; setTextColor(textColor); setPadding(dp(16), dp(12), dp(16), dp(12))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).isAppearanceLightStatusBars = false
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(navy) }
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        setContentView(root)
        val header = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL }
        header.addView(Button(this).apply {
            text = "‹"; contentDescription = "Back"; setTextColor(blue); setBackgroundColor(navy)
            setOnClickListener { navigateBack() }
        }, LinearLayout.LayoutParams(dp(56), dp(52)))
        header.addView(label(intent.getStringExtra("title").orEmpty().ifBlank { "PeraGo" }, 18f).apply {
            maxLines = 1; ellipsize = android.text.TextUtils.TruncateAt.END
        }, LinearLayout.LayoutParams(0, -2, 1f))
        header.addView(Button(this).apply {
            text = "×"; contentDescription = "Close"; setTextColor(blue); setBackgroundColor(navy); setOnClickListener { finish() }
        }, LinearLayout.LayoutParams(dp(56), dp(52)))
        root.addView(header)
        if (intent.getBooleanExtra("list", false)) showList(root) else showWeb(root, savedInstanceState)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() = navigateBack()
        })
        ViewCompat.requestApplyInsets(root)
    }

    private fun navigateBack() { val view = web; if (view?.canGoBack() == true) view.goBack() else finish() }

    private fun showList(root: LinearLayout) {
        val appData = intent.getStringExtra("app_data").orEmpty()
        val offers = OfferConfig.plan(true, appData, intent.getStringExtra("settings").orEmpty()).offers
        val locale = try { JSONObject(appData).optString("locale", "en") } catch (_: Exception) { "en" }
        root.addView(label(when (locale) {
            "ru", "kk" -> "Персональные предложения"
            "vi" -> "Đề xuất tài chính"
            "uz" -> "Shaxsiy takliflar"
            "fil" -> "Mga Alok para sa Iyo"
            else -> "Financial offers"
        }, 22f))
        val list = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(16), 0, dp(16), dp(16)) }
        for (offer in offers) {
            val card = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL; setBackgroundColor(Color.rgb(21, 47, 80))
                setPadding(dp(8), dp(8), dp(8), dp(8))
                addView(label(offer.title, 20f))
                val details = listOf(offer.amount, offer.term, offer.interest).filter { it.isNotBlank() }.joinToString(" • ")
                if (details.isNotBlank()) addView(label(details))
                addView(Button(this@OfferWebViewActivity).apply {
                    text = offer.cta; setTextColor(navy); setBackgroundTintList(ColorStateList.valueOf(blue)); isEnabled = OfferConfig.isWebUrl(offer.url)
                    setOnClickListener {
                        if (offer.openMode.equals("external", ignoreCase = true)) openExternal(offer.url)
                        else startActivity(Intent(this@OfferWebViewActivity, OfferWebViewActivity::class.java)
                            .putExtra("url", offer.url).putExtra("title", offer.title))
                    }
                })
            }
            list.addView(card, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(12) })
        }
        root.addView(ScrollView(this).apply { addView(list) }, LinearLayout.LayoutParams(-1, 0, 1f))
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun showWeb(root: LinearLayout, saved: Bundle?) {
        val url = intent.getStringExtra("url").orEmpty()
        if (!OfferConfig.isWebUrl(url)) { root.addView(label("This offer link is unavailable.")); return }
        val progress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply { max = 100; progressTintList = ColorStateList.valueOf(blue) }
        root.addView(progress, LinearLayout.LayoutParams(-1, dp(3)))
        val error = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; visibility = View.GONE
            addView(label("Could not load this page. Check your connection and try again."))
        }
        root.addView(error)
        val view = WebView(this).apply {
            setBackgroundColor(Color.WHITE)
            settings.apply {
                javaScriptEnabled = true; domStorageEnabled = true
                useWideViewPort = true; loadWithOverviewMode = true
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            }
        }
        web = view
        CookieManager.getInstance().apply { setAcceptCookie(true); setAcceptThirdPartyCookies(view, true) }
        error.addView(Button(this).apply { text = "Retry"; setTextColor(navy); setBackgroundTintList(ColorStateList.valueOf(blue)); setOnClickListener { error.visibility = View.GONE; view.reload() } })
        view.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(v: WebView?, value: Int) {
                progress.progress = value
                progress.visibility = if (value in 1..99) View.VISIBLE else View.GONE
            }
        }
        view.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(v: WebView?, request: WebResourceRequest?): Boolean {
                val target = request?.url?.toString() ?: return false
                if (OfferConfig.isWebUrl(target)) return false
                openExternal(target); return true
            }
            override fun onReceivedError(v: WebView?, request: WebResourceRequest?, issue: WebResourceError?) {
                if (request?.isForMainFrame == true) { error.visibility = View.VISIBLE; progress.visibility = View.GONE }
            }
        }
        root.addView(view, LinearLayout.LayoutParams(-1, 0, 1f))
        if (saved == null || view.restoreState(saved) == null) view.loadUrl(url)
    }

    private fun openExternal(url: String) {
        try {
            val target = if (url.startsWith("intent://")) Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                .apply { addCategory(Intent.CATEGORY_BROWSABLE); component = null; selector = null }
            else Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(target)
        } catch (_: Exception) { Toast.makeText(this, "Could not open this link.", Toast.LENGTH_SHORT).show() }
    }
    override fun onSaveInstanceState(outState: Bundle) { web?.saveState(outState); super.onSaveInstanceState(outState) }
    override fun onPause() { web?.onPause(); super.onPause() }
    override fun onResume() { super.onResume(); web?.onResume() }
    override fun onDestroy() {
        web?.apply { stopLoading(); (parent as? android.view.ViewGroup)?.removeView(this); destroy() }
        web = null; super.onDestroy()
    }
}
