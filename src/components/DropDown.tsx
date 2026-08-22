import {
  Text as ComposeText,
  DropdownMenu,
  DropdownMenuItem,
  Host,
  RNHostView,
} from "@expo/ui/jetpack-compose";
import { useState } from "react";
import { Pressable } from "react-native";

type Props = {
  trigger: React.ReactNode;
  items: { label: string; onPress: () => void }[];
};

export default function MainDropdownMenu({ trigger, items }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Host matchContents>
      <DropdownMenu
        expanded={isExpanded}
        onDismissRequest={() => setIsExpanded(false)}
      >
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <Pressable
              onPress={() => setIsExpanded(true)}
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              {trigger}
            </Pressable>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {items.map((item) => {
            return (
              <DropdownMenuItem
                onClick={() => {
                  setIsExpanded(false);
                  item.onPress();
                }}
                key={item.label}
              >
                <DropdownMenuItem.Text>
                  <ComposeText>{item.label}</ComposeText>
                </DropdownMenuItem.Text>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
