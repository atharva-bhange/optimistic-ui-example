import React from "react";
import { render } from "react-dom";
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	useQuery,
	useMutation,
	gql,
} from "@apollo/client";

// If running locally with a local version of the to-do server,
// change this URL to http://localhost:4000
const serverURL = "http://localhost:4000";

const client = new ApolloClient({
	uri: serverURL,
	cache: new InMemoryCache(),
});

const ADD_TODO = gql`
	mutation AddTodo($description: String!) {
		addTodo(description: $description) {
			id
			description
		}
	}
`;

// Component for adding a to-do item
function AddTodo() {
	let input;
	const [addTodo, { loading }] = useMutation(ADD_TODO, {
		refetchQueries: [GET_TODOS],
	});

	return (
		<div>
			{loading && <p>loading</p>}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					addTodo({
						variables: { description: input.value },

						// Optimistically add the Todo to the locally cached
						// list before the server responds
						optimisticResponse: {
							addTodo: {
								id: "temp-id",
								__typename: "Todo",
								description: input.value,
							},
						},
					});
					input.value = "";
				}}
			>
				<input
					ref={(node) => {
						input = node;
					}}
				/>
				<button type="submit">Create item</button>
			</form>
		</div>
	);
}

const GET_TODOS = gql`
	{
		todos {
			id
			description
		}
	}
`;

// Component for displaying the current to-do list
function Todos() {
	const { loading, error, data } = useQuery(GET_TODOS);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	const todos = data.todos.map(({ id, description }) => {
		return (
			<li key={id}>
				<p>{description}</p>
			</li>
		);
	});

	return (
		<div>
			<ul>{todos}</ul>
			{/* {mutationLoading && <p>Loading...</p>}
			{mutationError && <p>Error: {mutationError.message}</p>} */}
		</div>
	);
}

function App() {
	return (
		<ApolloProvider client={client}>
			<div>
				<h2>My to-do list</h2>
				<AddTodo />
				<Todos />
			</div>
		</ApolloProvider>
	);
}

render(<App />, document.getElementById("root"));
