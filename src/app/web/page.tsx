import NativePageGate from "@/components/cms/NativePageGate";
import WebDirectionClient from "./WebDirectionClient";

export default function WebDirectionPage() {
  return (
    <NativePageGate routePath="/web">
      <WebDirectionClient />
    </NativePageGate>
  );
}
