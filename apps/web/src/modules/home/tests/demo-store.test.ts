import { describe, it, expect } from "vitest";
import { useDemoUIStore } from "@/stores/home/demo-store";

describe("useDemoUIStore", () => {
  it("should have correct initial state", () => {
    const state = useDemoUIStore.getState();

    expect(state.selectedId).toBeNull();
    expect(state.isFormOpen).toBe(false);
    expect(state.formMode).toBe("create");
    expect(state.searchQuery).toBe("");
  });

  it("should set selectedId", () => {
    const { setSelectedId } = useDemoUIStore.getState();

    setSelectedId("123");

    expect(useDemoUIStore.getState().selectedId).toBe("123");
  });

  it("should set selectedId to null", () => {
    const { setSelectedId } = useDemoUIStore.getState();

    setSelectedId("123");
    setSelectedId(null);

    expect(useDemoUIStore.getState().selectedId).toBeNull();
  });

  it("should open form in create mode", () => {
    const { openForm } = useDemoUIStore.getState();

    openForm("create");

    const state = useDemoUIStore.getState();
    expect(state.isFormOpen).toBe(true);
    expect(state.formMode).toBe("create");
    expect(state.selectedId).toBeNull();
  });

  it("should open form in edit mode with id", () => {
    const { openForm } = useDemoUIStore.getState();

    openForm("edit", "456");

    const state = useDemoUIStore.getState();
    expect(state.isFormOpen).toBe(true);
    expect(state.formMode).toBe("edit");
    expect(state.selectedId).toBe("456");
  });

  it("should close form and reset selectedId", () => {
    const { openForm, closeForm } = useDemoUIStore.getState();

    openForm("edit", "789");
    closeForm();

    const state = useDemoUIStore.getState();
    expect(state.isFormOpen).toBe(false);
    expect(state.selectedId).toBeNull();
  });

  it("should set search query", () => {
    const { setSearchQuery } = useDemoUIStore.getState();

    setSearchQuery("test search");

    expect(useDemoUIStore.getState().searchQuery).toBe("test search");
  });

  it("should update multiple states correctly", () => {
    const store = useDemoUIStore.getState();

    store.openForm("edit", "999");
    expect(useDemoUIStore.getState().isFormOpen).toBe(true);
    expect(useDemoUIStore.getState().formMode).toBe("edit");
    expect(useDemoUIStore.getState().selectedId).toBe("999");

    store.setSearchQuery("query");
    expect(useDemoUIStore.getState().searchQuery).toBe("query");

    store.closeForm();
    expect(useDemoUIStore.getState().isFormOpen).toBe(false);
  });
});
