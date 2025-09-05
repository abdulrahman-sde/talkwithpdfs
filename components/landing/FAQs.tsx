"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import Link from "next/link";

type FAQItem = {
  id: string;
  icon: IconName;
  question: string;
  answer: string;
};

export default function FAQs() {
  const faqItems: FAQItem[] = [
    {
      id: "item-1",
      icon: "file-text",
      question: "What types of PDFs can I upload?",
      answer:
        "You can upload any type of PDF including text-based documents, scanned PDFs, forms, reports, research papers, and more. Our AI can handle complex layouts, tables, images, and multi-column formats. Files up to 50MB are supported on Pro plans.",
    },
    {
      id: "item-2",
      icon: "brain",
      question: "How accurate is the AI in understanding my documents?",
      answer:
        "Our AI is powered by advanced language models with high accuracy rates. It understands context, can reference specific sections, and maintains conversation history. For technical or specialized documents, accuracy is typically 95%+ with continuous improvements through user feedback.",
    },
    {
      id: "item-3",
      icon: "shield",
      question: "Is my data secure and private?",
      answer:
        "Absolutely. We use enterprise-grade encryption, secure cloud storage, and never use your documents to train our models. Your PDFs and conversations are private to your account. We're SOC 2 compliant and follow strict data protection protocols.",
    },
    {
      id: "item-4",
      icon: "zap",
      question: "How fast are the responses?",
      answer:
        "Most queries receive responses within 2-5 seconds. Response time depends on document complexity and query type. Simple factual questions are fastest, while complex analysis or summarization tasks may take slightly longer but rarely exceed 15 seconds.",
    },
    {
      id: "item-5",
      icon: "credit-card",
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from your account dashboard. Your access will continue until the end of your current billing period. You can also upgrade or downgrade plans as needed, with pro-rated billing adjustments.",
    },
  ];

  return (
    <section id="faqs" className=" py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="md:w-1/3">
            <div className="sticky top-20">
              <h2 className="mt-4 text-3xl font-bold">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground mt-4">
                Have questions about our PDF chat service? Check out our most
                common questions below or{" "}
                <Link
                  href="#"
                  className="text-primary font-medium hover:underline"
                >
                  contact our support team
                </Link>
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="bg-background shadow-xs rounded-lg border px-4 last:border-b"
                >
                  <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="flex size-6">
                        <DynamicIcon
                          name={item.icon}
                          className="m-auto size-4"
                        />
                      </div>
                      <span className="text-base">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="px-9">
                      <p className="text-base">{item.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
