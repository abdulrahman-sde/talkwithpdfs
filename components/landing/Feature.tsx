import {
  Cpu,
  Fingerprint,
  Pencil,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-18 md:pt-30 md:pb-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Revolutionary AI-Powered PDF Intelligence
          </h2>
          <p>
            Our advanced AI technology transforms static documents into
            interactive knowledge bases. Upload, chat, and discover insights
            from your PDFs like never before.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">Lightning Fast</h3>
            </div>
            <p className="text-sm">
              Get instant responses from your PDFs with our optimized AI engine.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-medium">Smart Analysis</h3>
            </div>
            <p className="text-sm">
              Advanced AI understands context, tables, images, and complex
              document structures.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="size-4" />

              <h3 className="text-sm font-medium">Secure & Private</h3>
            </div>
            <p className="text-sm">
              Your documents are encrypted and processed with enterprise-grade
              security.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pencil className="size-4" />

              <h3 className="text-sm font-medium">Multi-Format</h3>
            </div>
            <p className="text-sm">
              Support for various PDF types including scanned documents and
              forms.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4" />

              <h3 className="text-sm font-medium">Easy Integration</h3>
            </div>
            <p className="text-sm">
              Simple API and embeddable chat widgets for seamless integration.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />

              <h3 className="text-sm font-medium">AI-Powered</h3>
            </div>
            <p className="text-sm">
              Powered by latest language models for accurate understanding and
              responses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
