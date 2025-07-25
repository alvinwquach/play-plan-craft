"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/client-integration-nextjs";
import { PropsWithChildren } from "react";

function makeClient() {
  const isDev = process.env.NODE_ENV === "development";
  const graphqlUrl = isDev
    ? "http://localhost:3000/api/graphql"
    : process.env.NEXT_PUBLIC_GRAPHQL_URL ||
      "https://playplancraft.com/api/graphql";

  const httpLink = new HttpLink({
    uri: graphqlUrl,
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({ stripDefer: true }),
            httpLink,
          ])
        : httpLink,
  });
}

export function ApolloWrapper({ children }: PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
