import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "./Animations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
// 	import.meta.env.VITE_SUPABASE_URL!,
// 	import.meta.env.VITE_SUPABASE_ANON_KEY!
// );

const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("beginner");
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState({
    ip: "",
    country: "",
    device: "",
  });

  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setLocationData({
          ip: data.ip,
          country: data.country_name,
          device: navigator.userAgent,
        });
      } catch (error) {
        console.error("Failed to fetch location", error);
      }
    }
    fetchLocation();
  }, []);

  // const handleSubmit = async (e: React.FormEvent) => {
  // 	e.preventDefault();
  // 	setIsLoading(true);

  // 	try {
  // 		const response = await fetch("/api/submit-waitlist", {
  // 			method: "POST",
  // 			headers: {
  // 				"Content-Type": "application/json",
  // 			},
  // 			body: JSON.stringify({
  // 				name,
  // 				email,
  // 				experience,
  // 			}),
  // 		});

  // 		if (!response.ok) {
  // 			throw new Error("Failed to submit");
  // 		}

  // 		toast.success("You've been added to our waitlist!", {
  // 			description: "We'll notify you as soon as we launch.",
  // 		});
  // 		setEmail("");
  // 		setName("");
  // 		setExperience("beginner");
  // 	} catch (error) {
  // 		toast.error("Something went wrong", {
  // 			description: "Please try again later.",
  // 		});
  // 		console.error(error);
  // 	} finally {
  // 		setIsLoading(false);
  // 	}

  // 	// Simulate API call
  // 	setTimeout(() => {
  // 		toast.success("You've been added to our waitlist!", {
  // 			description: "We'll notify you as soon as we launch.",
  // 		});
  // 		setEmail("");
  // 		setName("");
  // 		setIsLoading(false);
  // 	}, 1500);
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  // 	e.preventDefault();
  // 	setIsLoading(true);

  // 	try {
  // 		// Check if email already exists
  // 		const { data: existingUser, error: checkError } = await supabase
  // 			.from("waitlist")
  // 			.select("id")
  // 			.eq("email", email)
  // 			.single(); // Only fetch one row

  // 		if (checkError && checkError.code !== "PGRST116") {
  // 			throw checkError;
  // 		}

  // 		if (existingUser) {
  // 			toast.error("This email is already on the waitlist!", {
  // 				description: "You have already signed up.",
  // 			});
  // 			setIsLoading(false);
  // 			return;
  // 		}

  // 		const { data, error } = await supabase.from("waitlist").insert([
  // 			{
  // 				name,
  // 				email,
  // 				experience,
  // 				ip_address: locationData.ip,
  // 				country: locationData.country,
  // 				device_info: locationData.device,
  // 			},
  // 		]);

  // 		if (error) throw error;

  // 		toast.success("You've been added to our waitlist!", {
  // 			description: "We'll notify you as soon as we launch.",
  // 		});
  // 		setEmail(""), setName(""), setExperience("beginner");
  // 	} catch (error) {
  // 		if (error.code === "23505") {
  // 			toast.error("This email is already on the waitlist!", {
  // 				description: "You have already signed up.",
  // 			});
  // 		} else {
  // 			toast.error("Something went wrong", {
  // 				description: "Please try again later.",
  // 			});
  // 			console.error(error);
  // 		}
  // 	} finally {
  // 		setIsLoading(false);
  // 	}
  // };

  return (
    <section id="waitlist" className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn direction="left">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
                Exclusive Access
              </span>
              <h2 className="heading-lg mb-6">Join the Waitlist Today</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Be the first to experience Tessium and receive exclusive
                early-access benefits:
              </p>

              {/* <ul className="space-y-4 mb-8">
								{[
									"500 TSIM points bonus upon full launch",
									"Priority access to premium courses",
									"Exclusive NFT for founding members",
									"Influence platform development with your feedback",
								].map((benefit, index) => (
									<li
										key={index}
										className="flex items-start"
									>
										<span className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-3 mt-0.5">
											✓
										</span>
										<span>{benefit}</span>
									</li>
								))}
							</ul> */}
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div className="bg-accent/5 rounded-2xl border border-border p-6 md:p-8 shadow-lg">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">
                  Reserve Your Spot
                </h3>
                <p className="text-muted-foreground">
                  Fill in your details below to join our exclusive waitlist.
                </p>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Web3 Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={cn(
                          "py-2 px-3 rounded-md border text-sm capitalize transition-all",
                          experience === level
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50"
                        )}
                        onClick={() => setExperience(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-lg font-medium bg-accent"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Join Waitlist"}
                </Button>

                <p className="text-xs text-muted-foreground text-center pt-4">
                  By joining, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
