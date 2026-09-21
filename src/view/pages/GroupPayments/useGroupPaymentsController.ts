import { useParams } from "react-router";

export function useGroupPaymentsController() {
  const { groupId } = useParams<{ groupId: string }>();

  return { groupId: groupId! };
}
