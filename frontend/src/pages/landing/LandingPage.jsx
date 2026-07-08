import TopNavbar from "../../components/layout/TopNavbar.jsx";
import HeroSection from "../../components/landing/HeroSection";
import StatsSection from "../../components/landing/StatsSection";
import FeaturesSection from "../../components/landing/FeaturesSection";

function LandingPage() {
    return (
        <>
            <TopNavbar />
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
        </>
    );
}

export default LandingPage;