import React from "react";
import { Button } from "@/components/ui/button";
import { FadeIn, ShimmerButton } from "./Animations";
import ParallaxEffect from "./ParallaxEffect";
import { ArrowDown } from "lucide-react";

const Hero: React.FC = () => {
	const scrollToFeatures = () => {
		const featuresElement = document.getElementById("features");
		if (featuresElement) {
			featuresElement.scrollIntoView({ behavior: "smooth" });
		}
	};
	const scrollToWaitlist = () => {
		const featuresElement = document.getElementById("waitlist");
		if (featuresElement) {
			featuresElement.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
			{/* Background elements */}
			<div className="absolute inset-0 -z-10 opacity-50">
				<div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
				<div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
			</div>

			<div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
				<div className="order-2 md:order-1">
					<FadeIn direction="up" delay={100}>
						<span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
							Revolutionizing Web3 Education
						</span>
					</FadeIn>

					<FadeIn direction="up" delay={300}>
						<h1 className="heading-xl mb-6">
							Learn, Earn, and{" "}
							<span className="text-accent">Thrive</span> in the
							Web3 Ecosystem
						</h1>
					</FadeIn>

					<FadeIn direction="up" delay={500}>
						<p className="text-lg text-muted-foreground mb-8 max-w-lg">
							Join Tessium, the premier learn-to-earn platform
							where knowledge acquisition translates directly to
							valuable rewards. Master blockchain concepts while
							earning tokens.
						</p>
					</FadeIn>

					<FadeIn direction="up" delay={700}>
						<div className="flex flex-col sm:flex-row gap-4">
							<ShimmerButton
								className="text-lg px-8 py-4 font-medium"
								onClick={scrollToWaitlist}
							>
								Join Waitlist
							</ShimmerButton>
							<Button
								variant="outline"
								className="text-lg px-8 py-4 font-medium h-full"
								onClick={scrollToFeatures}
							>
								Learn More
								<ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
							</Button>
						</div>
					</FadeIn>

					<FadeIn direction="up" delay={900}>
						<div className="mt-12 flex items-center gap-6">
							<div className="flex -space-x-2">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="w-8 h-8 rounded-full bg-muted border border-background"
									/>
								))}
							</div>
							<p className="text-sm text-muted-foreground">
								<span className="font-medium text-foreground">
									1,200+
								</span>{" "}
								users already on the waitlist
							</p>
						</div>
					</FadeIn>
				</div>

				<div className="order-1 md:order-2 relative">
					<ParallaxEffect baseVelocity={0.1}>
						<div className="relative h-[400px] sm:h-[500px] w-full">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-full h-full max-w-md rotate-3 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/80 to-accent p-1">
									<div className="bg-background w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
										<div className="w-full max-w-xs space-y-6 p-6">
											<div className="space-y-2">
												<div className="h-6 bg-primary/20 rounded-md w-2/3"></div>
												<div className="h-6 bg-primary/10 rounded-md w-1/2"></div>
											</div>

											<div className="space-y-2">
												<div className="h-20 bg-primary/5 rounded-lg w-full"></div>
												<div className="h-10 bg-primary/10 rounded-md w-full"></div>
											</div>

											<div className="h-10 bg-primary/80 rounded-md w-full"></div>

											<div className="flex justify-between">
												<div className="h-8 bg-primary/5 rounded-md w-[48%]"></div>
												<div className="h-8 bg-primary/5 rounded-md w-[48%]"></div>
											</div>
										</div>
									</div>
								</div>

								<div className="absolute -bottom-4 -right-4 sm:bottom-12 sm:right-0 w-40 h-40 rounded-lg rotate-6 neo-blur flex items-center justify-center">
									<div className="text-center p-4">
										<div className="font-bold text-xl">
											250 LRNT
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											Tokens Earned
										</div>
									</div>
								</div>

								<div className="absolute -top-4 -left-4 sm:top-12 sm:left-0 w-40 h-40 rounded-lg -rotate-6 neo-blur flex items-center justify-center">
									<div className="text-center p-4">
										<div className="font-bold text-xl">
											8.5k
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											XP Points
										</div>
									</div>
								</div>
							</div>
						</div>
					</ParallaxEffect>
				</div>
			</div>

			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
				<ArrowDown className="h-6 w-6 text-muted-foreground" />
			</div>
		</section>
	);
};

export default Hero;
