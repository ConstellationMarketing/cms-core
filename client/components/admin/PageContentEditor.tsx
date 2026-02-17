import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2, GripVertical } from "lucide-react";
import type {
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  PracticeAreasPageContent,
} from "../../lib/pageContentTypes";

const DEFAULT_MISSION = {
  heading: "",
  paragraphs: [] as string[],
  image: "",
  ctaPrimaryText: "",
  ctaPrimaryUrl: "",
  ctaSecondaryText: "",
  ctaSecondaryUrl: "",
};
const DEFAULT_HOME: HomePageContent = {
  hero: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    ctaText: "",
    ctaUrl: "",
    attorneyImage: "",
    badgeImage: "",
  },
  features: [],
  mission: DEFAULT_MISSION,
  attorney: {
    name: "",
    title: "",
    photo: "",
    bio: "",
    bullets: [],
    phone: "",
  },
  speakWithUs: {
    heading: "",
    description: "",
    image: "",
    ctaText: "",
    ctaUrl: "",
  },
  clientStories: {
    heading: "",
    subtitle: "",
    videos: [],
  },
  contactForm: {
    heading: "",
    image: "",
    badgeImage: "",
  },
  services: {
    heading: "",
    description: "",
    items: [],
    closingText: "",
  },
};

interface PageContentEditorProps {
  pageKey: string;
  content: unknown;
  onChange: (content: unknown) => void;
}

// Collapsible section component
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between text-lg">
              {title}
              <ChevronDown
                className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Array item editor
function ArrayEditor<T extends Record<string, unknown>>({
  items,
  onChange,
  renderItem,
  newItem,
  itemLabel = "Item",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (
    item: T,
    index: number,
    update: (item: T) => void,
  ) => React.ReactNode;
  newItem: () => T;
  itemLabel?: string;
}) {
  const addItem = () => {
    onChange([...items, newItem()]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, item: T) => {
    const newItems = [...items];
    newItems[index] = item;
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="relative border rounded-lg p-4 bg-gray-50">
          <div className="absolute top-2 right-2 flex gap-2">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm font-medium text-gray-500 mb-3">
            {itemLabel} {index + 1}
          </div>
          {renderItem(item, index, (updated) => updateItem(index, updated))}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {itemLabel}
      </Button>
    </div>
  );
}
function asRecord(v: unknown): Record<string, any> {
  return v && typeof v === "object" ? (v as any) : {};
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

// Home Page Editor
function HomePageEditor({
  content,
  onChange,
}: {
  content: HomePageContent;
  onChange: (c: HomePageContent) => void;
}) {

  // 1️⃣ SAFE OBJECT FIRST
  const safe: HomePageContent = (() => {
    const c = asRecord(content);

    const hero = { ...DEFAULT_HOME.hero, ...asRecord(c.hero) };
    const attorney = { ...DEFAULT_HOME.attorney, ...asRecord(c.attorney) };
    const speakWithUs = { ...DEFAULT_HOME.speakWithUs, ...asRecord(c.speakWithUs) };
    const clientStoriesRaw = asRecord(c.clientStories);
    const contactForm = { ...DEFAULT_HOME.contactForm, ...asRecord(c.contactForm) };
    const servicesRaw = asRecord(c.services);

    const missionRaw = asRecord(c.mission);
    const mission = {
      ...DEFAULT_MISSION,
      ...missionRaw,
      paragraphs: asStringArray(missionRaw.paragraphs),
    };

    const features = Array.isArray(c.features) ? c.features : [];
    const servicesItems = Array.isArray(servicesRaw.items) ? servicesRaw.items : [];
    const clientVideos = Array.isArray(clientStoriesRaw.videos) ? clientStoriesRaw.videos : [];

    return {
      ...DEFAULT_HOME,
      ...c,
      hero,
      attorney,
      speakWithUs,
      contactForm,
      mission,
      features,
      services: {
        ...DEFAULT_HOME.services,
        ...servicesRaw,
        items: servicesItems,
      },
      clientStories: {
        ...DEFAULT_HOME.clientStories,
        ...clientStoriesRaw,
        videos: clientVideos,
      },
    };
  })();

  // 2️⃣ UPDATE FUNCTION AFTER SAFE
  const update = <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K],
  ) => {
    onChange({ ...safe, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Section title="Hero Section">
        <div className="grid gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={safe.hero.title}
              onChange={(e) =>
                update("hero", { ...safe.hero, title: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              value={safe.hero.subtitle}
              onChange={(e) =>
                update("hero", { ...safe.hero, subtitle: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Background Image URL</Label>
            <Input
              value={safe.hero.backgroundImage}
              onChange={(e) =>
                update("hero", {
                  ...safe.hero,
                  backgroundImage: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CTA Text</Label>
              <Input
                value={safe.hero.ctaText}
                onChange={(e) =>
                  update("hero", { ...safe.hero, ctaText: e.target.value })
                }
              />
            </div>
            <div>
              <Label>CTA URL</Label>
              <Input
                value={safe.hero.ctaUrl}
                onChange={(e) =>
                  update("hero", { ...safe.hero, ctaUrl: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Attorney Image URL</Label>
            <Input
              value={safe.hero.attorneyImage}
              onChange={(e) =>
                update("hero", {
                  ...safe.hero,
                  attorneyImage: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Badge Image URL</Label>
            <Input
              value={safe.hero.badgeImage}
              onChange={(e) =>
                update("hero", { ...safe.hero, badgeImage: e.target.value })
              }
            />
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section title="Features" defaultOpen={false}>
        <ArrayEditor
          items={safe.features}
          onChange={(items) => update("features", items)}
          itemLabel="Feature"
          newItem={() => ({ icon: "trial-driven", title: "", description: "" })}
          renderItem={(item, _, updateItem) => (
            <div className="grid gap-3">
              <div>
                <Label>Icon Key</Label>
                <Input
                  value={item.icon}
                  onChange={(e) =>
                    updateItem({ ...item, icon: e.target.value })
                  }
                  placeholder="trial-driven, attorney, etc."
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updateItem({ ...item, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem({ ...item, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          )}
        />
      </Section>

      {/* Mission Section */}
      <Section title="Mission Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={asString(asRecord(content).mission?.heading)}
              onChange={(e) => {
                const mission = {
                  ...DEFAULT_MISSION,
                  ...asRecord(asRecord(content).mission),
                  heading: e.target.value,
                };

                update("mission", mission);
              }}
            />
          </div>
          <div>
            <Label>Paragraphs (one per line)</Label>
            <Textarea
              value={(asRecord(asRecord(content).mission).paragraphs as string[] | undefined)?.join("\n\n") ?? ""}
              onChange={(e) => {
                const mission = {
                  ...DEFAULT_MISSION,
                  ...asRecord(asRecord(content).mission),
                  paragraphs: e.target.value.split("\n\n").map(s => s.trim()).filter(Boolean),
                };
                update("mission", mission);
              }}
              rows={6}
            />

          </div>
          <div>
            <Label>Image URL</Label>
            <Input
            value={asString(asRecord(content).mission?.image)}
            onChange={(e) => {
              const mission = {
                ...DEFAULT_MISSION,
                ...asRecord(asRecord(content).mission),
                image: e.target.value,
              };
              update("mission", mission);
            }}
          />

          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary CTA Text</Label>
              <Input
              value={asString(asRecord(content).mission?.ctaPrimaryText)}
              onChange={(e) => {
                const mission = {
                  ...DEFAULT_MISSION,
                  ...asRecord(asRecord(content).mission),
                  ctaPrimaryText: e.target.value,
                };
                update("mission", mission);
              }}
            />

            </div>
            <div>
              <Label>Primary CTA URL</Label>
              <Input
              value={asString(asRecord(content).mission?.ctaPrimaryUrl)}
              onChange={(e) => {
                const mission = {
                  ...DEFAULT_MISSION,
                  ...asRecord(asRecord(content).mission),
                  ctaPrimaryUrl: e.target.value,
                };
                update("mission", mission);
              }}
            />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Secondary CTA Text</Label>
              <Input
              value={asString(asRecord(content).mission?.ctaSecondaryText)}
              onChange={(e) => {
                const mission = {
                  ...DEFAULT_MISSION,
                  ...asRecord(asRecord(content).mission),
                  ctaSecondaryText: e.target.value,
                };
                update("mission", mission);
              }}
            />
            </div>
            <div>
              <Label>Secondary CTA URL</Label>
              <Input
              value={asString(asRecord(content).mission?.ctaSecondaryUrl)}
              onChange={(e) => {
                const mission = {
                  ...DEFAULT_MISSION,
                  ...asRecord(asRecord(content).mission),
                  ctaSecondaryUrl: e.target.value,
                };
                update("mission", mission);
              }}
            />
            </div>
          </div>
        </div>
      </Section>

      {/* Attorney Section */}
      <Section title="Attorney Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={safe.attorney.name}
                onChange={(e) =>
                  update("attorney", {
                    ...safe.attorney,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={safe.attorney.title}
                onChange={(e) =>
                  update("attorney", {
                    ...safe.attorney,
                    title: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div>
            <Label>Photo URL</Label>
            <Input
              value={safe.attorney.photo}
              onChange={(e) =>
                update("attorney", {
                  ...safe.attorney,
                  photo: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea
              value={safe.attorney.bio}
              onChange={(e) =>
                update("attorney", { ...safe.attorney, bio: e.target.value })
              }
              rows={3}
            />
          </div>
          <div>
            <Label>Bullet Points (one per line)</Label>
            <Textarea
              value={safe.attorney.bullets.join("\n")}
              onChange={(e) =>
                update("attorney", {
                  ...safe.attorney,
                  bullets: e.target.value.split("\n").filter(Boolean),
                })
              }
              rows={4}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={safe.attorney.phone}
              onChange={(e) =>
                update("attorney", {
                  ...safe.attorney,
                  phone: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Section>

      {/* Speak With Us Section */}
      <Section title="Speak With Us Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={safe.speakWithUs.heading}
              onChange={(e) =>
                update("speakWithUs", {
                  ...safe.speakWithUs,
                  heading: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={safe.speakWithUs.description}
              onChange={(e) =>
                update("speakWithUs", {
                  ...safe.speakWithUs,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={safe.speakWithUs.image}
              onChange={(e) =>
                update("speakWithUs", {
                  ...safe.speakWithUs,
                  image: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CTA Text</Label>
              <Input
                value={safe.speakWithUs.ctaText}
                onChange={(e) =>
                  update("speakWithUs", {
                    ...safe.speakWithUs,
                    ctaText: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>CTA URL</Label>
              <Input
                value={safe.speakWithUs.ctaUrl}
                onChange={(e) =>
                  update("speakWithUs", {
                    ...safe.speakWithUs,
                    ctaUrl: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Client Stories Section */}
      <Section title="Client Stories Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={safe.clientStories.heading}
              onChange={(e) =>
                update("clientStories", {
                  ...safe.clientStories,
                  heading: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Textarea
              value={safe.clientStories.subtitle}
              onChange={(e) =>
                update("clientStories", {
                  ...safe.clientStories,
                  subtitle: e.target.value,
                })
              }
              rows={2}
            />
          </div>
          <ArrayEditor
            items={safe.clientStories.videos}
            onChange={(items) =>
              update("clientStories", {
                ...safe.clientStories,
                videos: items,
              })
            }
            itemLabel="Video"
            newItem={() => ({ embedUrl: "", thumbnail: "" })}
            renderItem={(item, _, updateItem) => (
              <div className="grid gap-3">
                <div>
                  <Label>Embed URL</Label>
                  <Input
                    value={item.embedUrl}
                    onChange={(e) =>
                      updateItem({ ...item, embedUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div>
                  <Label>Thumbnail URL</Label>
                  <Input
                    value={item.thumbnail}
                    onChange={(e) =>
                      updateItem({ ...item, thumbnail: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          />
        </div>
      </Section>

      {/* Contact Form Section */}
      <Section title="Contact Form Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={safe.contactForm.heading}
              onChange={(e) =>
                update("contactForm", {
                  ...safe.contactForm,
                  heading: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={safe.contactForm.image}
              onChange={(e) =>
                update("contactForm", {
                  ...safe.contactForm,
                  image: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Badge Image URL</Label>
            <Input
              value={safe.contactForm.badgeImage}
              onChange={(e) =>
                update("contactForm", {
                  ...safe.contactForm,
                  badgeImage: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section title="Services Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={safe.services.heading}
              onChange={(e) =>
                update("services", {
                  ...safe.services,
                  heading: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={safe.services.description}
              onChange={(e) =>
                update("services", {
                  ...safe.services,
                  description: e.target.value,
                })
              }
              rows={2}
            />
          </div>
          <ArrayEditor
            items={safe.services.items}
            onChange={(items) =>
              update("services", { ...safe.services, items })
            }
            itemLabel="Service"
            newItem={() => ({ title: "", icon: "CarFront" })}
            renderItem={(item, _, updateItem) => (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateItem({ ...item, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Icon (Lucide name)</Label>
                  <Input
                    value={item.icon}
                    onChange={(e) =>
                      updateItem({ ...item, icon: e.target.value })
                    }
                    placeholder="CarFront, Truck, etc."
                  />
                </div>
              </div>
            )}
          />
          <div>
            <Label>Closing Text</Label>
            <Textarea
              value={safe.services.closingText}
              onChange={(e) =>
                update("services", {
                  ...safe.services,
                  closingText: e.target.value,
                })
              }
              rows={2}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

// About Page Editor
function AboutPageEditor({
  content,
  onChange,
}: {
  content: AboutPageContent;
  onChange: (c: AboutPageContent) => void;
}) {
  const update = <K extends keyof AboutPageContent>(
    key: K,
    value: AboutPageContent[K],
  ) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Section title="Hero Section">
        <div className="grid gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={content.hero.title}
              onChange={(e) =>
                update("hero", { ...content.hero, title: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Background Image URL</Label>
            <Input
              value={content.hero.backgroundImage}
              onChange={(e) =>
                update("hero", {
                  ...content.hero,
                  backgroundImage: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Section>

      <Section title="Our Story" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Paragraphs (separate with blank line)</Label>
            <Textarea
              value={content.story.paragraphs.join("\n\n")}
              onChange={(e) =>
                update("story", {
                  ...content.story,
                  paragraphs: e.target.value.split("\n\n").filter(Boolean),
                })
              }
              rows={8}
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={content.story.image}
              onChange={(e) =>
                update("story", { ...content.story, image: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary CTA Text</Label>
              <Input
                value={content.story.ctaPrimaryText}
                onChange={(e) =>
                  update("story", {
                    ...content.story,
                    ctaPrimaryText: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Primary CTA URL</Label>
              <Input
                value={content.story.ctaPrimaryUrl}
                onChange={(e) =>
                  update("story", {
                    ...content.story,
                    ctaPrimaryUrl: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Attorney" defaultOpen={false}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={content.attorney.name}
                onChange={(e) =>
                  update("attorney", {
                    ...content.attorney,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={content.attorney.title}
                onChange={(e) =>
                  update("attorney", {
                    ...content.attorney,
                    title: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div>
            <Label>Photo URL</Label>
            <Input
              value={content.attorney.photo}
              onChange={(e) =>
                update("attorney", {
                  ...content.attorney,
                  photo: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Bio Paragraphs (separate with blank line)</Label>
            <Textarea
              value={content.attorney.bio.join("\n\n")}
              onChange={(e) =>
                update("attorney", {
                  ...content.attorney,
                  bio: e.target.value.split("\n\n").filter(Boolean),
                })
              }
              rows={6}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={content.attorney.phone}
              onChange={(e) =>
                update("attorney", {
                  ...content.attorney,
                  phone: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Section>

      <Section title="Our Approach" defaultOpen={false}>
        <ArrayEditor
          items={content.approach}
          onChange={(items) => update("approach", items)}
          itemLabel="Approach Card"
          newItem={() => ({ icon: "FileText", title: "", description: "" })}
          renderItem={(item, _, updateItem) => (
            <div className="grid gap-3">
              <div>
                <Label>Icon (Lucide name)</Label>
                <Input
                  value={item.icon}
                  onChange={(e) =>
                    updateItem({ ...item, icon: e.target.value })
                  }
                  placeholder="FileText, Scale, Users"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updateItem({ ...item, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem({ ...item, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Testimonials" defaultOpen={false}>
        <ArrayEditor
          items={content.testimonials}
          onChange={(items) => update("testimonials", items)}
          itemLabel="Testimonial"
          newItem={() => ({
            quote: "",
            name: "",
            initials: "",
            caseType: "",
            rating: 5,
          })}
          renderItem={(item, _, updateItem) => (
            <div className="grid gap-3">
              <div>
                <Label>Quote</Label>
                <Textarea
                  value={item.quote}
                  onChange={(e) =>
                    updateItem({ ...item, quote: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      updateItem({ ...item, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Initials</Label>
                  <Input
                    value={item.initials}
                    onChange={(e) =>
                      updateItem({ ...item, initials: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Case Type</Label>
                  <Input
                    value={item.caseType}
                    onChange={(e) =>
                      updateItem({ ...item, caseType: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="CTA Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={content.cta.heading}
              onChange={(e) =>
                update("cta", { ...content.cta, heading: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={content.cta.description}
              onChange={(e) =>
                update("cta", { ...content.cta, description: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={content.cta.phone}
              onChange={(e) =>
                update("cta", { ...content.cta, phone: e.target.value })
              }
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

// Contact Page Editor
function ContactPageEditor({
  content,
  onChange,
}: {
  content: ContactPageContent;
  onChange: (c: ContactPageContent) => void;
}) {
  const update = <K extends keyof ContactPageContent>(
    key: K,
    value: ContactPageContent[K],
  ) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Section title="Hero Section">
        <div className="grid gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={content.hero.title}
              onChange={(e) =>
                update("hero", { ...content.hero, title: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Textarea
              value={content.hero.subtitle}
              onChange={(e) =>
                update("hero", { ...content.hero, subtitle: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label>Background Image URL</Label>
            <Input
              value={content.hero.backgroundImage}
              onChange={(e) =>
                update("hero", {
                  ...content.hero,
                  backgroundImage: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Section>

      <Section title="Contact Info" defaultOpen={false}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={content.info.phone}
                onChange={(e) =>
                  update("info", { ...content.info, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone Note</Label>
              <Input
                value={content.info.phoneNote}
                onChange={(e) =>
                  update("info", { ...content.info, phoneNote: e.target.value })
                }
                placeholder="Available 24/7"
              />
            </div>
          </div>
          <div>
            <Label>Address (one line per entry)</Label>
            <Textarea
              value={content.info.address.join("\n")}
              onChange={(e) =>
                update("info", {
                  ...content.info,
                  address: e.target.value.split("\n").filter(Boolean),
                })
              }
              rows={2}
            />
          </div>
          <div>
            <Label>Address Label</Label>
            <Input
              value={content.info.addressLabel}
              onChange={(e) =>
                update("info", {
                  ...content.info,
                  addressLabel: e.target.value,
                })
              }
              placeholder="Main Office"
            />
          </div>
        </div>
      </Section>

      <Section title="Contact Form" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={content.form.heading}
              onChange={(e) =>
                update("form", { ...content.form, heading: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={content.form.image}
              onChange={(e) =>
                update("form", { ...content.form, image: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Badge Image URL</Label>
            <Input
              value={content.form.badgeImage}
              onChange={(e) =>
                update("form", { ...content.form, badgeImage: e.target.value })
              }
            />
          </div>
        </div>
      </Section>

      <Section title="Office Hours" defaultOpen={false}>
        <ArrayEditor
          items={content.officeHours}
          onChange={(items) => update("officeHours", items)}
          itemLabel="Hours Entry"
          newItem={() => ({ label: "", hours: "" })}
          renderItem={(item, _, updateItem) => (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Label</Label>
                <Input
                  value={item.label}
                  onChange={(e) =>
                    updateItem({ ...item, label: e.target.value })
                  }
                  placeholder="Monday - Friday"
                />
              </div>
              <div>
                <Label>Hours</Label>
                <Input
                  value={item.hours}
                  onChange={(e) =>
                    updateItem({ ...item, hours: e.target.value })
                  }
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>
            </div>
          )}
        />
        <div className="mt-4">
          <Label>Hours Note</Label>
          <Input
            value={content.hoursNote}
            onChange={(e) =>
              onChange({ ...content, hoursNote: e.target.value })
            }
            placeholder="Appointments available by request"
          />
        </div>
      </Section>

      <Section title="Map" defaultOpen={false}>
        <div>
          <Label>Google Maps Embed URL</Label>
          <Input
            value={content.mapEmbedUrl}
            onChange={(e) =>
              onChange({ ...content, mapEmbedUrl: e.target.value })
            }
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
        </div>
      </Section>

      <Section title="CTA Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={content.cta.heading}
              onChange={(e) =>
                update("cta", { ...content.cta, heading: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={content.cta.description}
              onChange={(e) =>
                update("cta", { ...content.cta, description: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={content.cta.phone}
              onChange={(e) =>
                update("cta", { ...content.cta, phone: e.target.value })
              }
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

// Practice Areas Page Editor
function PracticeAreasPageEditor({
  content,
  onChange,
}: {
  content: PracticeAreasPageContent;
  onChange: (c: PracticeAreasPageContent) => void;
}) {
  const update = <K extends keyof PracticeAreasPageContent>(
    key: K,
    value: PracticeAreasPageContent[K],
  ) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Section title="Hero Section">
        <div className="grid gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={content.hero.title}
              onChange={(e) =>
                update("hero", { ...content.hero, title: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Background Image URL</Label>
            <Input
              value={content.hero.backgroundImage}
              onChange={(e) =>
                update("hero", {
                  ...content.hero,
                  backgroundImage: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Section>

      <Section title="Introduction" defaultOpen={false}>
        <div>
          <Label>Intro Text</Label>
          <Textarea
            value={content.intro}
            onChange={(e) => onChange({ ...content, intro: e.target.value })}
            rows={3}
          />
        </div>
      </Section>

      <Section title="Practice Areas" defaultOpen={false}>
        <ArrayEditor
          items={content.areas}
          onChange={(items) => update("areas", items)}
          itemLabel="Practice Area"
          newItem={() => ({ name: "", icon: "CarFront", description: "" })}
          renderItem={(item, _, updateItem) => (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      updateItem({ ...item, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Icon (Lucide name)</Label>
                  <Input
                    value={item.icon}
                    onChange={(e) =>
                      updateItem({ ...item, icon: e.target.value })
                    }
                    placeholder="CarFront, Truck, etc."
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem({ ...item, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Understanding Your Options" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={content.options.heading}
              onChange={(e) =>
                update("options", {
                  ...content.options,
                  heading: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Text</Label>
            <Textarea
              value={content.options.text}
              onChange={(e) =>
                update("options", { ...content.options, text: e.target.value })
              }
              rows={3}
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={content.options.image}
              onChange={(e) =>
                update("options", { ...content.options, image: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary CTA Text</Label>
              <Input
                value={content.options.ctaPrimaryText}
                onChange={(e) =>
                  update("options", {
                    ...content.options,
                    ctaPrimaryText: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Primary CTA URL</Label>
              <Input
                value={content.options.ctaPrimaryUrl}
                onChange={(e) =>
                  update("options", {
                    ...content.options,
                    ctaPrimaryUrl: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="CTA Section" defaultOpen={false}>
        <div className="grid gap-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={content.cta.heading}
              onChange={(e) =>
                update("cta", { ...content.cta, heading: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={content.cta.description}
              onChange={(e) =>
                update("cta", { ...content.cta, description: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={content.cta.phone}
              onChange={(e) =>
                update("cta", { ...content.cta, phone: e.target.value })
              }
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

// Main PageContentEditor component
export default function PageContentEditor({
  pageKey,
  content,
  onChange,
}: PageContentEditorProps) {
  // Determine which editor to show based on page key
  const urlPath = typeof pageKey === "string" ? pageKey : "";

  if (urlPath === "/" || urlPath === "/home") {
    return (
      <HomePageEditor
        content={content as HomePageContent}
        onChange={onChange}
      />
    );
  }

  if (urlPath === "/about") {
    return (
      <AboutPageEditor
        content={content as AboutPageContent}
        onChange={onChange}
      />
    );
  }

  if (urlPath === "/contact") {
    return (
      <ContactPageEditor
        content={content as ContactPageContent}
        onChange={onChange}
      />
    );
  }

  if (urlPath === "/practice-areas") {
    return (
      <PracticeAreasPageEditor
        content={content as PracticeAreasPageContent}
        onChange={onChange}
      />
    );
  }

  // Fallback for other pages - show raw JSON editor
  return (
    <Section title="Page Content (JSON)">
      <Textarea
        value={JSON.stringify(content, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            // Invalid JSON, ignore
          }
        }}
        rows={20}
        className="font-mono text-sm"
      />
    </Section>
  );
}
