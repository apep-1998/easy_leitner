# How to Add a New Card Type

This document provides a technical guide on how to add a new card type to the Easy Leitner system.

## 1. Define the New Card Type

First, you need to define the new card type in `types/index.ts`. This involves creating a new Zod schema for the card's configuration and adding it to the `CardConfigSchema` union.

**Example:**

Let's say we want to add a `MultipleChoice` card type.

In `types/index.ts`, add the following:

```typescript
export const MultipleChoiceCardConfigSchema = z.object({
  type: z.literal("multiple-choice"),
  question: z.string(),
  voice_file_url: z.string().url().nullable(),
  image_url: z.string().url().nullable(),
  answer: z.string(),
  options: z.array(z.string()),
});
```

Then, add the new schema to the `CardConfigSchema` and `CardSchema` unions:

```typescript
export const CardConfigSchema = z.union([
  // ... other schemas
  MultipleChoiceCardConfigSchema, // Add this
]);

export const CardSchema = z.object({
  // ...
  config: z.union([
    // ... other schemas
    MultipleChoiceCardConfigSchema, // Add this
  ]),
  // ...
});
```

Finally, export the new type:

```typescript
export type MultipleChoiceCardConfig = z.infer<
  typeof MultipleChoiceCardConfigSchema
>;
```

## 2. Create a New Form Component

Next, create a new React component for the card's creation and editing form under `components/card-forms/`. The component should take `onChange`, `setIsReadyToSubmit`, and an optional `initialData` as props. The `initialData` prop is used to pre-fill the form when editing an existing card.

**Example:**

Create a new file `components/card-forms/MultipleChoiceCardForm.tsx`:

```typescript
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
// ... other imports

export default function MultipleChoiceCardForm({
  onChange,
  setIsReadyToSubmit,
  initialData, // For editing
}: {
  onChange: (data: any) => void;
  setIsReadyToSubmit: (isReady: boolean) => void;
  initialData?: Partial<MultipleChoiceCardConfig>;
}) {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");
  const [options, setOptions] = useState<string[]>(initialData?.options || ["", ""]);
  // ... other state for image and voice files

  useEffect(() => {
    // Trim and validate inputs
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map(opt => opt.trim());
    const trimmedAnswer = answer.trim();

    onChange({
      question: trimmedQuestion,
      answer: trimmedAnswer,
      options: trimmedOptions,
      // ... other fields
    });
    
    // Logic to enable/disable the save button
    setIsReadyToSubmit(
      !!trimmedQuestion &&
      !!trimmedAnswer &&
      trimmedOptions.length > 1 &&
      trimmedOptions.every((opt) => !!opt) &&
      trimmedOptions.includes(trimmedAnswer)
    );
  }, [question, answer, options, onChange, setIsReadyToSubmit]);

  // ... (logic for adding/removing options, file uploads, etc.)

  return (
    <ThemedView>
      // ... (form inputs for question, options, answer picker, etc.)
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // ... (styles)
});
```

## 3. Create a New Exam Component

Create a new React component for the card's exam view under `components/card-exams/`. This component will display the card during a review session and handle its own state for answer checking and updating the card's level in Firebase.

**Example:**

Create a new file `components/card-exams/MultipleChoiceCardExam.tsx`:

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Card, MultipleChoiceCardConfig } from "@/types";
// ... other imports

interface MultipleChoiceCardExamProps {
  card: Card;
}

const MultipleChoiceCardExam: React.FC<MultipleChoiceCardExamProps> = ({
  card,
}) => {
  const config = card.config as MultipleChoiceCardConfig;
  // ... (state and handlers for the exam logic, answer checking, etc.)

  return (
    <View style={styles.container}>
      // ... (exam view JSX for question, image, and shuffled options)
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (styles)
});

export default MultipleChoiceCardExam;
```

## 4. Integrate into the Add Card Screen

Update `app/(tabs)/add-card.tsx` to include the new card type in the selection dropdown and render the new form component.

1.  **Update `CardType`**:
    ```typescript
    type CardType = "standard" | "spelling" | "multiple-choice";
    ```
2.  **Import the new form component**:
    ```typescript
    import MultipleChoiceCardForm from "@/components/card-forms/MultipleChoiceCardForm";
    ```
3.  **Add the new card type to the `ThemedPicker`**:
    ```typescript
    <ThemedPicker
      onValueChange={(value) => setCardType(value)}
      items={[
        { label: "Standard", value: "standard" },
        { label: "Spelling", value: "spelling" },
        { label: "Multiple Choice", value: "multiple-choice" },
      ]}
      value={cardType}
    />
    ```
4.  **Render the new form component in `renderCardForm`**:
    ```typescript
    const renderCardForm = () => {
      switch (cardType) {
        // ... (other cases)
        case "multiple-choice":
          return (
            <MultipleChoiceCardForm
              key={formKey}
              onChange={setCardData}
              setIsReadyToSubmit={setIsReadyToSubmit}
            />
          );
        default:
          return null;
      }
    };
    ```

## 5. Integrate into the Edit Card Screen

Update `app/edit-card.tsx` to render the form for the new card type, pre-filled with the card's data.

In `app/edit-card.tsx`, update the `renderCardForm` function:

```typescript
const renderCardForm = () => {
  if (!card) return null;

  switch (card.config.type) {
    // ... (other cases)
    case "multiple-choice":
      return (
        <MultipleChoiceCardForm
          onChange={setCardData}
          setIsReadyToSubmit={setIsReadyToSubmit}
          initialData={card.config}
        />
      );
    default:
      return null;
  }
};
```

## 6. Integrate into the Card List Screen

Update `app/cards.tsx` to display a summary of the new card type's information.

In the `CardItem` component within `app/cards.tsx`, update the `renderCardSpecifics` function:

```typescript
const renderCardSpecifics = () => {
  switch (card.config.type) {
    // ... (other cases)
    case "multiple-choice":
      return <ThemedText>Question: {card.config.question}</ThemedText>;
    default:
      return null;
  }
};
```

## 7. Integrate into the Exam Screen

Finally, update `app/exam.tsx` to render the new exam component.

1.  **Import the new exam component**:
    ```typescript
    import MultipleChoiceCardExam from "@/components/card-exams/MultipleChoiceCardExam";
    ```
2.  **Add a new condition to render the component**:
    ```typescript
    {currentCard?.config.type === "multiple-choice" && (
      <MultipleChoiceCardExam card={currentCard} />
    )}
    ```

## 8. Update Import/Export Functions

To ensure the new card type is compatible with the box import/export feature, you must update the cloud functions.

1.  **Update `functions/src/box/export.ts`**:
    *   Add your new card config type to the `CardConfig` type union.
    *   If your card includes new fields that store file URLs (like `image_url` or `voice_file_url`), add these field names to the `knownFileFields` array. This ensures the files are downloaded and included in the exported `.zip` archive.

    ```typescript
    type CardConfig =
      | {
          // ... other types
        }
      | {
          type: "multiple-choice";
          question: string;
          voice_file_url: string | null;
          image_url: string | null;
          answer: string;
          options: string[];
        };
    
    // ...

    const processedCards = await Promise.all(
        cards.map(async (card) => {
            const newConfig = { ...card.config };
            const knownFileFields = [
                "voice_file_url",
                "pronunciation_file",
                "pronunciation_file_url",
                "image_url", // Add new file fields here
            ];
            // ...
        })
    );
    ```

2.  **Verify `functions/src/box/import.ts`**:
    *   The import function is designed to be generic. As long as your file URLs in the exported `cards.json` are prefixed with `@data/`, the `processCardConfig` function should automatically handle uploading them to storage and replacing the path with the new URL. No changes are typically needed, but it's good practice to verify this behavior.

