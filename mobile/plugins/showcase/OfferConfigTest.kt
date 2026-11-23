package app.stash

import org.junit.Assert.*
import org.junit.Test

class OfferConfigTest {
    private val data = """{"country":"PH","locale":"fil"}"""
    private fun plan(settings: String, enabled: Boolean = true, appData: String = data) = OfferConfig.plan(enabled, appData, settings, "en")
    @Test fun disabledFlagAlwaysOpensTracker() {
        assertEquals(OfferTarget.TRACKER, plan("""{"offers":[{"url":"https://example.test"}]}""", false).target)
    }
    @Test fun emptyAndMalformedSettingsOpenTracker() {
        for (value in listOf("", "invalid", "{}", "{\"offers\":[]}")) assertEquals(OfferTarget.TRACKER, plan(value).target)
    }
    @Test fun countryLocalizedOfferOverridesGlobalAndUsesBrowserMode() {
        val result = plan("""{"offers":[{"providerName":"Global","url":"https://global.test"}],"countries":{"PH":{"offers":[{"providerName":"Base","url":"https://country.test","openMode":"external","parameters":{"amount":"100"},"locales":{"fil":{"providerName":"Localized","ctaText":"Open","parameters":{"amount":"200"}}}}]}}}""")
        assertEquals(OfferTarget.FIRST_OFFER, result.target)
        val first = result.offers.first(); assertEquals("Localized", first.title); assertEquals("200", first.amount)
        assertEquals("Open", first.cta); assertEquals("external", first.openMode); assertEquals("https://country.test", first.url)
    }
    @Test fun countryFallbackPrecedesGlobalAndEmptyCountryFallsBackToRoot() {
        val result = plan("""{"offers":[{"url":"https://global.test"}],"countries":{"PH":{"fallbackOffers":[{"url":"https://fallback.test"}]}}}""")
        assertEquals("https://fallback.test", result.offers.first().url)
        assertEquals("https://global.test", plan("""{"offers":[{"url":"https://global.test"}],"countries":{"PH":{"offers":[]}}}""").offers.first().url)
        assertEquals("https://root-fallback.test", plan("""{"fallbackOffers":[{"url":"https://root-fallback.test"}]}""").offers.first().url)
    }
    @Test fun featuredThenPriorityThenRatingDeterminesFirstOffer() {
        val result = plan("""{"offers":[{"url":"https://other.test","priority":1,"rating":5},{"url":"https://low.test","isFeatured":true,"priority":3},{"url":"https://second.test","isFeatured":true,"priority":2,"rating":4},{"url":"https://first.test","isFeatured":true,"priority":2,"rating":5}]}""")
        assertEquals("https://first.test", result.offers.first().url)
    }
    @Test fun blankOrUnsafeFirstUrlShowsListInsteadOfSkippingToAnotherOffer() {
        for (url in listOf("", "javascript:alert(1)", "file:///data/local", "https://")) {
            val result = plan("""{"offers":[{"url":"$url","priority":1},{"url":"https://valid.test","priority":2}]}""")
            assertEquals(OfferTarget.LIST, result.target)
        }
    }
    @Test fun malformedAppDataKeepsGlobalFallbackAndDefaultWebView() {
        val first = plan("""{"offers":[{"url":"https://example.test"}]}""", appData = "invalid").offers.first()
        assertEquals("webview", first.openMode)
        assertTrue(OfferConfig.isWebUrl("http://example.test")); assertFalse(OfferConfig.isWebUrl("intent://example"))
    }
}
