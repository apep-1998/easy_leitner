import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { onCardsSnapshotInBox } from "@/firebase/box";
import { deleteCard } from "@/firebase/card";
import { Card } from "@/types";
import { formatDistanceToNow } from "@/utils/time";

const CardItem = ({ card }: { card: Card }) => {
  const router = useRouter();

  const renderCardSpecifics = () => {
    switch (card.config.type) {
      case "spelling":
        return <ThemedText>Spelling: {card.config.spelling}</ThemedText>;
      case "standard":
        return <ThemedText>Front: {card.config.front}</ThemedText>;
      case "word-standard":
        return <ThemedText>Word: {card.config.word}</ThemedText>;
      case "german-verb-conjugator":
        return <ThemedText>Verb: {card.config.verb}</ThemedText>;
      case "multiple-choice":
        return <ThemedText>Question: {card.config.question}</ThemedText>;
      default:
        return null;
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          if (card.id) {
            deleteCard(card.id);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEdit = () => {
    router.push({
      pathname: "/edit-card",
      params: { cardId: card.id },
    });
  };

  return (
    <ThemedView style={styles.cardContainer}>
      <ThemedView>
        <ThemedText>Level: {card.level}</ThemedText>
        <ThemedText>
          Next Review: {formatDistanceToNow(card.nextReviewTime)}
        </ThemedText>
        <ThemedText>Type: {card.config.type}</ThemedText>
        {renderCardSpecifics()}
      </ThemedView>
      <ThemedView style={styles.cardActions}>
        <TouchableOpacity onPress={handleEdit} style={styles.button}>
          <FontAwesome name="pencil" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.button}>
          <FontAwesome name="trash" size={20} color="red" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

export default function CardsScreen() {
  const { boxId } = useLocalSearchParams<{ boxId: string }>();
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    if (boxId) {
      const unsubscribe = onCardsSnapshotInBox(boxId, (fetchedCards) => {
        const typedCards = fetchedCards.map((card) => ({
          ...card,
          nextReviewTime: card.nextReviewTime.toDate(),
        }));
        setCards(typedCards);
      });
      return () => unsubscribe();
    }
  }, [boxId]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={cards}
          renderItem={({ item }) => <CardItem card={item} />}
          keyExtractor={(item) => item.id || ""}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  cardActions: {
    flexDirection: "row",
  },
  button: {
    marginLeft: 15,
  },
});
