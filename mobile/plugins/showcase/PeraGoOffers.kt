package app.stash

import android.app.Activity
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings
import java.util.concurrent.atomic.AtomicBoolean

/** Startup-only remote offers. The finance ledger is never read or transmitted here. */
internal object PeraGoOffers {
    fun start(activity: Activity) {
        val overlay = LinearLayout(activity).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.rgb(7, 20, 38))
            isClickable = true
            isFocusable = true
            addView(ImageView(activity).apply {
                setImageResource(R.drawable.perago_startup)
                contentDescription = "PeraGo"
            }, LinearLayout.LayoutParams(dp(activity, 96), dp(activity, 96)).apply { bottomMargin = dp(activity, 24) })
            addView(ProgressBar(activity).apply { indeterminateTintList = ColorStateList.valueOf(Color.rgb(169, 214, 255)) })
        }
        activity.addContentView(overlay, ViewGroup.LayoutParams(-1, -1))
        var appDataRaw = "{}"
        var settingsRaw = "{}"
        val completed = AtomicBoolean(false)
        val handler = Handler(Looper.getMainLooper())
        fun finish(plan: OfferPlan) {
            if (!completed.compareAndSet(false, true)) return
            handler.removeCallbacksAndMessages(null)
            (overlay.parent as? ViewGroup)?.removeView(overlay)
            if (activity.isFinishing || activity.isDestroyed || plan.target == OfferTarget.TRACKER) return
            val intent = if (plan.target == OfferTarget.FIRST_OFFER) {
                val offer = plan.offers.first()
                if (offer.openMode.equals("external", ignoreCase = true)) {
                    Intent(Intent.ACTION_VIEW, android.net.Uri.parse(offer.url))
                } else {
                    Intent(activity, OfferWebViewActivity::class.java).putExtra("url", offer.url).putExtra("title", offer.title)
                }
            } else {
                Intent(activity, OfferWebViewActivity::class.java).putExtra("list", true)
                    .putExtra("app_data", appDataRaw).putExtra("settings", settingsRaw)
            }
            try {
                activity.startActivity(intent)
                activity.finish()
            } catch (_: Exception) {
                // No URL handler: keep the working local dashboard available.
            }
        }
        // Never allow a slow fetch to interrupt a form after the dashboard becomes available.
        handler.postDelayed({ finish(OfferPlan(OfferTarget.TRACKER)) }, 6_000)
        try {
            val remote = FirebaseRemoteConfig.getInstance()
            val options = FirebaseRemoteConfigSettings.Builder().setMinimumFetchIntervalInSeconds(0)
                .setFetchTimeoutInSeconds(5).build()
            remote.setConfigSettingsAsync(options).continueWithTask {
                remote.setDefaultsAsync(mapOf("task_validator" to false,
                    "app_data" to "{\"country\":\"ZZ\",\"locale\":\"en\"}",
                    "settings" to "{\"offers\":[],\"fallbackOffers\":[],\"countries\":{}}"))
            }.continueWithTask { remote.fetchAndActivate() }.addOnCompleteListener {
                try {
                    appDataRaw = remote.getString("app_data")
                    settingsRaw = remote.getString("settings")
                    finish(OfferConfig.plan(remote.getBoolean("task_validator"), appDataRaw, settingsRaw))
                } catch (_: Exception) { finish(OfferPlan(OfferTarget.TRACKER)) }
            }
        } catch (_: Exception) { finish(OfferPlan(OfferTarget.TRACKER)) }
    }
    private fun dp(activity: Activity, value: Int) = (value * activity.resources.displayMetrics.density).toInt()
}
