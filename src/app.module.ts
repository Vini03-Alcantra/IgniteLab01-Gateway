import { Module } from '@nestjs/common';
import {GraphQLModule} from "@nestjs/graphql"
import {ApolloGatewayDriver, ApolloGatewayDriverConfig} from '@nestjs/apollo'
import {IntrospectAndCompose, RemoteGraphQLDataSource} from "@apollo/gateway";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        cors: true,
        context: ({req}) => {
          return {headers: req.headers}
        }
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {name: "purchase", url: "http://localhost:3335/graphql"},
            {name: "classroom", url: "http://localhost:3336/graphql"}
          ]
        }),
        buildService: ({ url }) => {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
              request.http.headers.set(
                'authorization',
                context?.['headers']?.['authorization']
              )
            }
          })
        }
      }
    })
  ],
})
export class AppModule {}
