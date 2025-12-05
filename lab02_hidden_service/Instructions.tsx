import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";

export function Instructions() {
  return (
    <Document>
      <Page size="A4" style={{ padding: 32 }}>
        <Text>To decrypt your files perform the following steps:</Text>
        <View style={{ margin: 8 }}>
          <Text>1. Download the private key</Text>
          <Text>2. Place the private key next to the ransom executable</Text>
          <Text>3. Open the terminal in that folder</Text>
          <Text>4. Run the executable with "./ransomware"</Text>
        </View>
        <Text>
          When the exectuable is finished your files should be back to normal!
        </Text>
      </Page>
    </Document>
  );
}
