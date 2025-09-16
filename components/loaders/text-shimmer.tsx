import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
export default function AIResponseLoader() {
  return (
    <TextShimmer className="font-mono text-sm ms-12" duration={1}>
      Getting Response ...
    </TextShimmer>
  );
}
