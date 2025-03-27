import React from "react";
import { FadeIn } from "./Animations";
import { cn } from "@/lib/utils";

interface StepCardProps {
	number: number;
	title: string;
	description: string;
	isActive?: boolean;
	delay?: number;
}

const scrollToWaitlist = () => {
	const featuresElement = document.getElementById("waitlist");
	if (featuresElement) {
		featuresElement.scrollIntoView({ behavior: "smooth" });
	}
};

const StepCard: React.FC<StepCardProps> = ({
	number,
	title,
	description,
	isActive = false,
	delay = 0,
}) => {
	return (
		<FadeIn delay={delay} direction="up">
			<div
				className={cn(
					"p-6 md:p-8 rounded-2xl transition-all duration-300",
					isActive
						? "bg-primary/7 border border-primary/20"
						: "bg-primary/5 border border-border hover:bg-primary"
				)}
			>
				<div className="flex items-start gap-5">
					<div
						className={cn(
							"flex items-center justify-center w-10 h-10 rounded-full text-lg font-semibold shrink-0",
							isActive
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						)}
					>
						{number}
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-2">{title}</h3>
						<p className="text-muted-foreground leading-relaxed">
							{description}
						</p>
					</div>
				</div>
			</div>
		</FadeIn>
	);
};

const HowItWorks: React.FC = () => {
	const steps = [
		{
			number: 1,
			title: "Join the Waitlist",
			description:
				"Sign up to be among the first to experience Tessium when we launch. Get early access to exclusive features and bonuses.",
			delay: 100,
		},
		{
			number: 2,
			title: "Create Your Profile",
			description:
				"Set up your profile, connect your wallet, and personalize your learning journey based on your interests and expertise level.",
			delay: 200,
		},
		{
			number: 3,
			title: "Explore Courses",
			description:
				"Browse our extensive catalog of Web3 courses, ranging from blockchain basics to advanced smart contract development.",
			delay: 300,
		},
		{
			number: 4,
			title: "Complete Learning Modules",
			description:
				"Work through interactive lessons, quizzes, and practical assignments to build your knowledge and skills.",
			delay: 400,
		},
		{
			number: 5,
			title: "Earn Rewards",
			description:
				"Receive tokens as you complete courses, pass assessments, and contribute to the community. The more you learn, the more you earn.",
			isActive: true,
			delay: 500,
		},
		{
			number: 6,
			title: "Showcase Achievements",
			description:
				"Display your certificates and credentials on your profile, and share them across your professional networks.",
			delay: 600,
		},
	];

	return (
		<section id="how-it-works" className="py-24 px-6">
			<div className="max-w-7xl mx-auto">
				<FadeIn direction="up">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
							Simple Process
						</span>
						<h2 className="heading-lg mb-6">How Tessium Works</h2>
						<p className="text-lg text-muted-foreground">
							Our streamlined approach combines education with
							incentives, creating an engaging and rewarding
							learning experience.
						</p>
					</div>
				</FadeIn>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{steps.map((step) => (
						<StepCard
							key={step.number}
							number={step.number}
							title={step.title}
							description={step.description}
							isActive={step.isActive}
							delay={step.delay}
						/>
					))}
				</div>

				<FadeIn direction="up" delay={700} className="mt-16">
					<div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
						<div className="grid md:grid-cols-2 gap-12 items-center">
							<div>
								<h3 className="heading-md mb-6">
									Ready to transform your learning experience?
								</h3>
								<p className="text-muted-foreground mb-8">
									Join Tessium today and be part of the
									educational revolution that rewards your
									progress and dedication with tangible
									benefits.
								</p>
								<button
									onClick={scrollToWaitlist}
									className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
								>
									Join the Waitlist
								</button>
							</div>

							<div className="bg-background rounded-xl p-6 shadow-lg">
								<div className="space-y-5">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="flex items-center gap-4"
										>
											<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
												{i}
											</div>
											<div className="space-y-2 flex-1">
												<div className="h-4 bg-muted rounded w-3/4"></div>
												<div className="h-3 bg-muted/50 rounded w-1/2"></div>
											</div>
										</div>
									))}

									<div className="h-16 rounded-lg bg-primary/10 mt-6 flex items-center justify-center">
										<div className="font-medium text-primary">
											Up to 500 TSIM tokens to earn
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</FadeIn>
			</div>
		</section>
	);
};

export default HowItWorks;
