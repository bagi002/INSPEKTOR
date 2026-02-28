import { useState } from "react";
import { createCaseInterrogation } from "../services/caseInterrogationsApi";
import {
  EMPTY_INTERROGATION_NODE_FORM,
  sortInterrogationNodes,
} from "./caseInterrogationsHelpers";
import {
  INITIAL_INTERROGATION_FORM,
  normalizeNodeErrors,
} from "./caseInterrogationsStateUtils";
import {
  buildNodeFromDraft,
  collectInterrogationNodesForRemoval,
  validateInterrogationFormBeforeSubmit,
} from "./caseInterrogationCreateStateUtils";

export function useCaseInterrogationCreateState({
  caseId,
  onUnauthorized,
  alivePeople,
  selectedPersonId,
  refreshInterrogations,
  onSaved,
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [formData, setFormData] = useState(INITIAL_INTERROGATION_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [nodeDraft, setNodeDraft] = useState(EMPTY_INTERROGATION_NODE_FORM);
  const [nodeDraftError, setNodeDraftError] = useState("");
  const [editingInterrogationId, setEditingInterrogationId] = useState(null);
  function resetCreateState() {
    setFormErrors({});
    setSubmitError("");
    setSubmitSuccessMessage("");
    setNodeDraftError("");
    setNodeDraft(EMPTY_INTERROGATION_NODE_FORM);
  }
  function openCreateModal(preselectedPersonId = null) {
    const parsedPreselectedId = Number.parseInt(preselectedPersonId, 10);
    const defaultPersonId = Number.isInteger(parsedPreselectedId) && parsedPreselectedId > 0
      ? String(parsedPreselectedId)
      : selectedPersonId || (alivePeople[0] ? String(alivePeople[0].id) : "");

    setFormData({
      personId: defaultPersonId,
      title: "",
      openingPrompt: "",
      nodes: [],
    });
    setEditingInterrogationId(null);
    resetCreateState();
    setIsCreateModalOpen(true);
  }
  function openEditModal(interrogation) {
    const personId = Number.parseInt(interrogation?.personId, 10);
    const safeNodes = sortInterrogationNodes(interrogation?.nodes).map((node) => ({
      nodeKey: String(node?.nodeKey || ""),
      parentKey: String(node?.parentKey || ""),
      questionReferenceKey: String(node?.questionReferenceKey || node?.nodeKey || ""),
      question: String(node?.question || ""),
      answer: String(node?.answer || ""),
      sequenceOrder: Number(node?.sequenceOrder) || 1,
    }));

    setFormData({
      personId: Number.isInteger(personId) && personId > 0 ? String(personId) : "",
      title: String(interrogation?.title || ""),
      openingPrompt: String(interrogation?.openingPrompt || ""),
      nodes: safeNodes,
    });
    setEditingInterrogationId(Number(interrogation?.id) || null);
    resetCreateState();
    setIsCreateModalOpen(true);
  }
  function closeCreateModal() {
    if (!isSubmitting) {
      setIsCreateModalOpen(false);
    }
  }
  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }
      const nextErrors = { ...previous };
      delete nextErrors[name];
      return nextErrors;
    });
  }
  function handleNodeDraftChange(event) {
    const { name, value } = event.target;
    setNodeDraft((previous) => {
      if (name !== "sourceNodeKey") {
        return { ...previous, [name]: value };
      }

      return {
        ...previous,
        sourceNodeKey: value,
        question: "",
        answer: "",
      };
    });
    setNodeDraftError("");
  }
  function handleAddNode() {
    const { error, node, nextNodeDraft } = buildNodeFromDraft(formData.nodes, nodeDraft);
    if (error || !node || !nextNodeDraft) {
      setNodeDraftError(error || "Dodavanje pitanja nije uspelo.");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      nodes: [...previous.nodes, node],
    }));
    setNodeDraft(nextNodeDraft);
    setNodeDraftError("");
    setFormErrors((previous) => {
      if (!previous.nodes) {
        return previous;
      }
      const nextErrors = { ...previous };
      delete nextErrors.nodes;
      return nextErrors;
    });
  }
  function handleRemoveNode(nodeKey) {
    setFormData((previous) => {
      const keysToRemove = collectInterrogationNodesForRemoval(previous.nodes, nodeKey);
      const nextNodes = previous.nodes
        .filter((node) => !keysToRemove.has(node.nodeKey))
        .map((node, index) => ({
          ...node,
          sequenceOrder: index + 1,
        }));
      return {
        ...previous,
        nodes: nextNodes,
      };
    });
  }
  async function handleCreateInterrogation(event) {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccessMessage("");
    const nextErrors = validateInterrogationFormBeforeSubmit(formData);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setIsSubmitting(true);
    const payload = {
      personId: Number.parseInt(formData.personId, 10),
      title: formData.title,
      openingPrompt: formData.openingPrompt,
      nodes: formData.nodes,
    };
    const result = await createCaseInterrogation(caseId, payload);
    if (!result.ok) {
      if (result.unauthorized) {
        setIsSubmitting(false);
        onUnauthorized();
        return;
      }
      setFormErrors((previous) => ({
        ...previous,
        ...(result.errors || {}),
      }));
      const nodeErrors = normalizeNodeErrors(result.errors);
      if (Object.keys(nodeErrors).length > 0) {
        setNodeDraftError("Proveri validaciju stabla pitanja i odgovora.");
      }
      setSubmitError(result.message || "Čuvanje saslušanja nije uspelo.");
      setIsSubmitting(false);
      return;
    }
    const savedInterrogationId = Number(result.data?.interrogation?.id) || null;
    setSubmitSuccessMessage(
      result.message ||
        (editingInterrogationId
          ? "Saslušanje je uspešno ažurirano."
          : "Saslušanje je uspešno sačuvano.")
    );
    await refreshInterrogations();
    setIsSubmitting(false);
    setIsCreateModalOpen(false);
    setEditingInterrogationId(null);
    if (savedInterrogationId) {
      onSaved(savedInterrogationId);
    }
  }
  return {
    isCreateModalOpen,
    isSubmitting,
    submitError,
    submitSuccessMessage,
    isEditMode: Boolean(editingInterrogationId),
    formData,
    formErrors,
    nodeDraft,
    nodeDraftError,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    handleFieldChange,
    handleNodeDraftChange,
    handleAddNode,
    handleRemoveNode,
    handleCreateInterrogation,
    setIsCreateModalOpen,
  };
}
