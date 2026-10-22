import AIInput from "./ai-input.tsx";
import Dock, { DockDropdownItem, DockIcon, DockItem, DockLink } from "./dock.tsx";
import HoverArrowButton from "./hover-arrow-button.tsx";
import ShimmerButton from "./shimmer-button.tsx";
import SlideUpButton from "./slideup-button.tsx";
import FocusButton from "./focus-button.tsx";
import GlowingBorderButton from "./glowing-border-button.tsx";
import NeoBrutalistButton from "./neo-brutalist-button.tsx";
import PremiumButton from "./premium-button.tsx";
import { StatsCards } from "./stats-cards.tsx";
import DancingLetters from "./dancing-letters.tsx";
import TextLoop from "./text-loop.tsx";
import FeatureSteps from "./feature-steps.tsx";

const ASSET = "https://raw.githubusercontent.com/amarnathdhumal/chamaacui/main/public";

const STEPS = [
  {
    step: "Step 1",
    title: "Mountain Adventure",
    content:
      "A stunning mountain landscape captured at sunrise. The peaks are illuminated by the golden light of the morning sun.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop",
  },
  {
    step: "Step 2",
    title: "City Lights",
    content:
      "Night view of a vibrant city glowing with lights. The urban skyline reflects the energy and bustle of city life.",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop",
  },
  {
    step: "Step 3",
    title: "Forest Path",
    content:
      "A peaceful walking trail surrounded by lush greenery. The path winds through the dense forest, offering a serene escape.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop",
  },
];

export function ChamaacInput() {
  return (
    <div className="h-full bg-white text-zinc-900">
      <AIInput placeholder="Ask anything..." className="bg-white" />
    </div>
  );
}

export function ChamaacButtons() {
  return (
    <div className="flex h-full w-full flex-wrap content-start items-center justify-center gap-4 overflow-auto bg-white p-6">
      <HoverArrowButton text="Get Started" duration={0.3} iconSize={20} />
      <ShimmerButton text="Book a Free Call" />
      <SlideUpButton className="bg-[#f73b20] text-white">Learn More</SlideUpButton>
      <FocusButton>Contact us</FocusButton>
      <GlowingBorderButton>Book a Call</GlowingBorderButton>
      <NeoBrutalistButton text="Click Me" />
      <PremiumButton text="Premium Button" />
    </div>
  );
}

export function ChamaacDock() {
  return (
    <div className="relative h-full w-full bg-white">
      <Dock bottomOffset="28px">
        <DockIcon
          icon={
            <svg className="text-black" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.25 8.00001H6.75V19.5H17.25V8.00001H18.75V18.75C18.75 19.9926 17.7426 21 16.5 21H7.5C6.25736 21 5.25 19.9926 5.25 18.75L5.25 8.00001Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M10.7166 3.72814C11.4883 3.19225 12.5117 3.19225 13.2834 3.72814L22.0438 9.81177L21.1882 11.0438L12 4.66312L2.81177 11.0438L1.95618 9.81177L10.7166 3.72814Z" fill="currentColor" />
            </svg>
          }
          href="/"
        />
        <DockItem label="Personal">
          <DockDropdownItem label="Jeton Card" href="/jeton-card" image={`${ASSET}/personal/1.jpg`} />
          <DockDropdownItem label="Fees" href="/fees" image={`${ASSET}/personal/2.jpg`} />
        </DockItem>
        <DockLink
          label="Business"
          href="/business"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-black" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.166 9.88297V10.55H11.5V9.88297V5.16701C11.5 4.79862 11.2014 4.49999 10.833 4.49999H6.11703H5.45002V5.83402H6.11703H9.22266L4.97165 10.085L4.5 10.5567L5.4433 11.5L5.91496 11.0283L10.166 6.77731V9.88297Z" fill="currentColor" />
            </svg>
          }
        />
        <DockItem label="Company">
          <DockDropdownItem label="About" href="/about" image={`${ASSET}/company/1.jpg`} />
          <DockDropdownItem label="Newsroom" href="/newsroom" image={`${ASSET}/company/2.jpg`} />
          <DockDropdownItem label="Partnerships" href="/partnerships" image={`${ASSET}/company/3.jpg`} />
          <DockDropdownItem label="Media Assets" href="/media-assets" image={`${ASSET}/company/4.jpg`} />
          <DockDropdownItem label="Release Notes" href="/release-notes" image={`${ASSET}/company/5.jpg`} />
        </DockItem>
      </Dock>
    </div>
  );
}

export function ChamaacCards() {
  return (
    <div className="h-full w-full overflow-auto bg-orange-50">
      <StatsCards
        width="w-70"
        height="h-84"
        images={[`${ASSET}/images/models/1.png`, `${ASSET}/images/models/2.png`]}
      />
    </div>
  );
}

export function ChamaacLetters() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <DancingLetters text="ANIMATE" />
    </div>
  );
}

export function ChamaacLoop() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <TextLoop />
    </div>
  );
}

export function ChamaacSteps() {
  return (
    <div className="h-full w-full overflow-auto bg-white">
      <FeatureSteps features={STEPS} autoPlayInterval={6000} imageClassName="h-[300px] md:h-auto" />
    </div>
  );
}
