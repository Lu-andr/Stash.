package app.stash

import org.json.JSONArray
import org.json.JSONObject
import java.net.URI
import java.util.Locale

internal data class RemoteOffer(
    val title: String, val url: String, val openMode: String, val cta: String,
    val amount: String, val term: String, val interest: String,
    val featured: Boolean, val priority: Int, val rating: Double,
)
internal enum class OfferTarget { TRACKER, FIRST_OFFER, LIST }
internal data class OfferPlan(val target: OfferTarget, val offers: List<RemoteOffer> = emptyList())

internal object OfferConfig {
    fun isWebUrl(url: String): Boolean = try {
        val parsed = URI(url)
        parsed.scheme?.lowercase(Locale.US) in setOf("http", "https") && !parsed.host.isNullOrBlank()
    } catch (_: Exception) { false }

    fun plan(enabled: Boolean, appData: String, settings: String, language: String = Locale.getDefault().language): OfferPlan {
        if (!enabled) return OfferPlan(OfferTarget.TRACKER)
        val offers = parse(appData, settings, language)
        if (offers.isEmpty()) return OfferPlan(OfferTarget.TRACKER)
        return OfferPlan(if (isWebUrl(offers.first().url)) OfferTarget.FIRST_OFFER else OfferTarget.LIST, offers)
    }

    private fun parse(appData: String, settings: String, language: String): List<RemoteOffer> = try {
        val data = try { JSONObject(appData) } catch (_: Exception) { JSONObject() }
        val country = data.optString("country", "ZZ").uppercase(Locale.US)
        val locale = data.optString("locale", "en").lowercase(Locale.US)
        val root = JSONObject(settings)
        fun list(block: JSONObject?): JSONArray? {
            if (block == null) return null
            return block.optJSONArray("offers")?.takeIf { it.length() > 0 }
                ?: block.optJSONArray("fallbackOffers")?.takeIf { it.length() > 0 }
        }
        val items = list(root.optJSONObject("countries")?.optJSONObject(country)) ?: list(root) ?: JSONArray()
        (0 until items.length()).mapNotNull { index ->
            val item = items.optJSONObject(index) ?: return@mapNotNull null
            val translations = item.optJSONObject("locales")
            val localized = translations?.optJSONObject(locale) ?: translations?.optJSONObject(language.lowercase(Locale.US))
            fun text(key: String, fallback: String): String = localized?.optString(key)?.takeIf { it.isNotBlank() }
                ?: item.optString(key, fallback)
            fun param(key: String): String = localized?.optJSONObject("parameters")?.optString(key)?.takeIf { it.isNotBlank() }
                ?: item.optJSONObject("parameters")?.optString(key).orEmpty()
            RemoteOffer(text("providerName", "Offer"), item.optString("url", "").trim(), item.optString("openMode", "webview"),
                text("ctaText", "Apply"), param("amount"), param("term"), param("interestRate"),
                item.optBoolean("isFeatured", false), item.optInt("priority", 99), item.optDouble("rating", 4.8))
        }.sortedWith(compareByDescending<RemoteOffer> { it.featured }.thenBy { it.priority }.thenByDescending { it.rating })
    } catch (_: Exception) { emptyList() }
}
