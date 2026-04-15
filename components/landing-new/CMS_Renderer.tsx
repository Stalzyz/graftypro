
"use client";

import React from "react";
import LandingHero from "./LandingHero";
import FeatureGrid from "./FeatureGrid";
import Integrations from "./Integrations";
import MasterDifference from "./MasterDifference";
import DynamicPricing from "./DynamicPricing";
import Prerequisites from "./Prerequisites";
import WhyGrafty from "./WhyGrafty";
import ModulesOverview from "./ModulesOverview";
import VendorValue from "./VendorValue";
import Testimonials from "./Testimonials";
import CTA_Strip from "./CTA_Strip";
import VideoBlock from "./VideoBlock";
import FAQBlock from "./FAQBlock";
import PopupBlock from "./PopupBlock";

import {
    HeroV2,
    TickerV2,
    StatsStripV2,
    ProductTabsV2,
    SplitListV2,
    GrowthStepsV2,
    MultiCardsV2,
    FinalCTAV2,
    LogoWallV2,
    InteractiveCardV2,
    ImageCarouselV2
} from "./cms-blocks/CMSBlocks_V2";

import {
    NeuralKnowledgeShowcase,
    OmniHubSynergy,
    AutopilotDrive
} from "./cms-blocks/CMSBlocks_V3";

const COMPONENTS: Record<string, React.FC<any>> = {
    HERO: LandingHero,
    FEATURES: FeatureGrid,
    INTEGRATIONS: Integrations,
    DIFFERENCE: MasterDifference,
    PRICING: DynamicPricing,
    PREREQUISITES: Prerequisites,
    WHY_GRAFTY: WhyGrafty,
    MODULES: ModulesOverview,
    VENDOR_VALUE: VendorValue,
    TESTIMONIALS: Testimonials,
    CTA: CTA_Strip,
    VIDEO: VideoBlock,
    FAQ: FAQBlock,
    POPUP: PopupBlock,

    // Monster CMS V2 Blocks
    HERO_V2: HeroV2,
    TICKER_V2: TickerV2,
    STATS_STRIP_V2: StatsStripV2,
    PRODUCT_TABS_V2: ProductTabsV2,
    SPLIT_LIST_V2: SplitListV2,
    GROWTH_STEPS_V2: GrowthStepsV2,
    MULTI_CARDS_V2: MultiCardsV2,
    FINAL_CTA_V2: FinalCTAV2,
    LOGO_WALL_V2: LogoWallV2,
    INTERACTIVE_CARD_V2: InteractiveCardV2,
    IMAGE_CAROUSEL_V2: ImageCarouselV2,

    // Flagship V3 Blocks
    NEURAL_KNOWLEDGE_V3: NeuralKnowledgeShowcase,
    OMNI_HUB_V3: OmniHubSynergy,
    AUTOPILOT_V3: AutopilotDrive,

    CUSTOM_HTML: ({ content }: { content: any }) => (
        <section dangerouslySetInnerHTML={{ __html: content.html }} />
    ),
};

export default function CMSRenderer({ sections }: { sections: any[] }) {
    if (!sections || !Array.isArray(sections)) return null;

    return (
        <>
            {sections.map((section) => {
                const Component = COMPONENTS[section.type];
                if (!Component) return null;

                return <Component key={section.id} {...section.content} />;
            })}
        </>
    );
}
