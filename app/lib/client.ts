import { HttpLink, ApolloClient, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/client-integration-nextjs";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const isDev = process.env.NODE_ENV === "development";
  const graphqlUrl = isDev
    ? "http://localhost:3000/api/graphql"
    : process.env.NEXT_PUBLIC_GRAPHQL_URL ||
      "https://playplancraft.com/api/graphql";

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: graphqlUrl,
    }),
  });
});
