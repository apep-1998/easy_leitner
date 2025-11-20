# How to Add a New Card Type

This document provides a technical guide on how to add a new card type to the Easy Leitner system.

## 1. Define the New Card Type

First, you need to define the new card type in `types/index.ts`. This involves creating a new Zod schema for the card's configuration and adding it to the `CardConfigSchema` union.

**Example:**

Let's say we want to add a `WordStandard` card type.

In `types/index.ts`, add the following:

```typescript
export const WordStandardCardConfigSchema = z.object({
  type: z.literal("word-standard"),
  word: z.string(),
  part_of_speech: z.string(),
  pronunciation_file: z.string().url(),
  back: z.string(),
});
```

Then, add the new schema to the `CardConfigSchema` and `CardSchema` unions:

```typescript
export const CardConfigSchema = z.union([
  StandardCardConfigSchema,
  SpellingCardConfigSchema,
  WordStandardCardConfigSchema, // Add this
]);

export const CardSchema = z.object({
  // ...
  config: z.union([
    StandardCardConfigSchema,
    SpellingCardConfigSchema,
    WordStandardCardConfigSchema, // Add this
  ]),
  // ...
});
```

Finally, export the new type:

```typescript
export type WordStandardCardConfig = z.infer<
  typeof WordStandardCardConfigSchema
>;
```

## 2. Create a New Form Component

Next, create a new React component for the card's creation and editing form under `components/card-forms/`. The component should take `onChange`, `setIsReadyToSubmit`, and an optional `initialData` as props. The `initialData` prop is used to pre-fill the form when editing an existing card.

**Example:**

Create a new file `components/card-forms/WordStandardCardForm.tsx`:

```typescript
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
// ... other imports

export default function WordStandardCardForm({
  onChange,
  setIsReadyToSubmit,
  initialData, // For editing
}: {
  onChange: (data: any) => void;
  setIsReadyToSubmit: (isReady: boolean) => void;
  // Add initialData to the props
  initialData?: {
    word?: string;
    part_of_speech?: string;
    back?: string;
    pronunciation_file?: string;
  };
}) {
  // Use initialData to set the initial state
  const [word, setWord] = useState(initialData?.word || "");
  const [partOfSpeech, setPartOfSpeech] = useState(initialData?.part_of_speech || "");
  const [back, setBack] = useState(initialData?.back || "");
  const [pronunciationFile, setPronunciationFile] = useState(initialData?.pronunciation_file || "");
  // ... rest of the component state

  useEffect(() => {
    onChange({
      word,
      part_of_speech: partOfSpeech,
      back,
      pronunciation_file: pronunciationFile,
    });
    setIsReadyToSubmit(
      !!word && !!partOfSpeech && !!back && !!pronunciationFile,
    );
  }, [word, partOfSpeech, back, pronunciationFile, onChange, setIsReadyToSubmit]);

  // ... (audio recording and upload logic)

  return (
    <ThemedView>
      // ... (form inputs)
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // ... (styles)
});
```

## 3. Create a New Exam Component

Create a new React component for the card's exam view under `components/card-exams/`. This component will display the card during a review session.

**Example:**

Create a new file `components/card-exams/WordStandardCardExam.tsx`:

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Card, WordStandardCardConfig } from "@/types";
// ... other imports

interface WordStandardCardExamProps {
  card: Card;
}

const WordStandardCardExam: React.FC<WordStandardCardExamProps> = ({
  card,
}) => {
  const config = card.config as WordStandardCardConfig;
  // ... (state and handlers for the exam logic)

  return (
    <View style={styles.container}>
      // ... (exam view JSX)
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (styles)
});

export default WordStandardCardExam;
```

## 4. Integrate into the Add Card Screen

Update `app/(tabs)/add-card.tsx` to include the new card type in the selection dropdown and render the new form component.

1.  **Update `CardType`**:
    ```typescript
    type CardType = "standard" | "spelling" | "word-standard";
    ```
2.  **Import the new form component**:
    ```typescript
    import WordStandardCardForm from "@/components/card-forms/WordStandardCardForm";
    ```
3.  **Add the new card type to the `ThemedPicker`**:
    ```typescript
    <ThemedPicker
      onValueChange={(value) => setCardType(value)}
      items={[
        { label: "Standard", value: "standard" },
        { label: "Spelling", value: "spelling" },
        { label: "Word Standard", value: "word-standard" },
      ]}
      value={cardType}
    />
    ```
4.  **Render the new form component in `renderCardForm`**:
    ```typescript
    const renderCardForm = () => {
      switch (cardType) {
        // ... (other cases)
        case "word-standard":
          return (
            <WordStandardCardForm
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
    case "word-standard":
      return (
        <WordStandardCardForm
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
    case "word-standard":
      return <ThemedText>Word: {card.config.word}</ThemedText>;
    default:
      return null;
  }
};
```

## 7. Integrate into the Exam Screen

Finally, update `app/exam.tsx` to render the new exam component.

1.  **Import the new exam component**:
    ```typescript
    import WordStandardCardExam from "@/components/card-exams/WordStandardCardExam";
    ```
2.  **Add a new condition to render the component**:
    ```typescript
    {currentCard?.config.type === "word-standard" && (
      <WordStandardCardExam card={currentCard} />
    )}
    ```