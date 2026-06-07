import dynamic from "next/dynamic"; const NeuroFocus = dynamic(() => import("../components/NeuroFocus"), { ssr: false });

export default function Home() {
  return <NeuroFocus />;
}
