"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm({ initialQuery = "", onSubmit }: { initialQuery?: string; onSubmit: (query: string) => void }) {
  const [query, setQuery] = useState(initialQuery);
  return (
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const value = query.trim(); if (value) onSubmit(value); }}>
      <label className="sr-only" htmlFor="search-query">Buscar versículos</label>
      <Input id="search-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: princípio, amor, luz" />
      <Button type="submit">Buscar</Button>
    </form>
  );
}
