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

const MEDIA = "/motion-lab/media/chamaac";

const STEPS = [
  {
    step: "Step 1",
    title: "Mountain Adventure",
    content:
      "A stunning mountain landscape captured at sunrise. The peaks are illuminated by the golden light of the morning sun.",
    image: `${MEDIA}/steps/1.jpg`,
  },
  {
    step: "Step 2",
    title: "City Lights",
    content:
      "Night view of a vibrant city glowing with lights. The urban skyline reflects the energy and bustle of city life.",
    image: `${MEDIA}/steps/2.jpg`,
  },
  {
    step: "Step 3",
    title: "Forest Path",
    content:
      "A peaceful walking trail surrounded by lush greenery. The path winds through the dense forest, offering a serene escape.",
    image: `${MEDIA}/steps/3.jpg`,
  },
];

function Stage({ children, className = "" }) {
  return <div className={`font-grotesk flex h-full w-full items-center justify-center bg-white ${className}`}>{children}</div>;
}

export function ChamaacInput() {
  return (
    <div className="font-grotesk h-full bg-white text-zinc-900">
      <AIInput placeholder="Ask anything..." className="bg-white" />
    </div>
  );
}

export function ChamaacArrow() {
  return (
    <Stage>
      <HoverArrowButton text="Get Started" duration={0.3} iconSize={20} className="bg-black text-white" />
    </Stage>
  );
}

export function ChamaacShimmer() {
  return (
    <Stage>
      <ShimmerButton text="Book a Free Call" />
    </Stage>
  );
}

export function ChamaacSlide() {
  return (
    <Stage>
      <SlideUpButton className="bg-[#f73b20] text-white">Learn More</SlideUpButton>
    </Stage>
  );
}

export function ChamaacFocus() {
  return (
    <Stage>
      <FocusButton>Contact us</FocusButton>
    </Stage>
  );
}

export function ChamaacGlow() {
  return (
    <Stage>
      <GlowingBorderButton>Book a Call</GlowingBorderButton>
    </Stage>
  );
}

export function ChamaacNeo() {
  return (
    <Stage>
      <NeoBrutalistButton text="Click Me" />
    </Stage>
  );
}

export function ChamaacPremium() {
  return (
    <Stage>
      <PremiumButton text="Premium Button" />
    </Stage>
  );
}

export function ChamaacDock() {
  return (
    <div className="font-grotesk relative h-full w-full bg-white">
      <Dock bottomOffset="calc(50% - 24px)">
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
          <DockDropdownItem label="Jeton Card" href="/jeton-card" image={`${MEDIA}/personal/1.jpg`} />
          <DockDropdownItem label="Fees" href="/fees" image={`${MEDIA}/personal/2.jpg`} />
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
          <DockDropdownItem label="About" href="/about" image={`${MEDIA}/company/1.jpg`} />
          <DockDropdownItem label="Newsroom" href="/newsroom" image={`${MEDIA}/company/2.jpg`} />
          <DockDropdownItem label="Partnerships" href="/partnerships" image={`${MEDIA}/company/3.jpg`} />
          <DockDropdownItem label="Media Assets" href="/media-assets" image={`${MEDIA}/company/4.jpg`} />
          <DockDropdownItem label="Release Notes" href="/release-notes" image={`${MEDIA}/company/5.jpg`} />
        </DockItem>
      </Dock>
    </div>
  );
}

export function ChamaacCards() {
  return (
    <div className="font-grotesk flex min-h-full w-full items-center justify-center bg-orange-50 py-4">
      <StatsCards width="w-64" height="h-78" />
    </div>
  );
}

export function ChamaacLetters() {
  return (
    <Stage>
      <DancingLetters text="ANIMATE" />
    </Stage>
  );
}

export function ChamaacLoop() {
  return (
    <Stage className="overflow-hidden px-6">
      <TextLoop className="max-w-full justify-center text-[clamp(1.75rem,4.6vw,3.25rem)] md:text-[clamp(1.75rem,4.6vw,3.25rem)]" />
    </Stage>
  );
}

export function ChamaacSteps() {
  return (
    <div className="font-grotesk flex min-h-full w-full items-center justify-center bg-white px-4 py-4 md:px-12">
      <FeatureSteps features={STEPS} autoPlayInterval={6000} imageClassName="h-[300px] md:h-auto" />
    </div>
  );
}
