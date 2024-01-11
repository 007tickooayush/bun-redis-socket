// import { useEffect, useState } from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { SocketContext } from './context/socket'
import Details from './components/Details';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Center, CloseButton, Container, HStack, Heading, Highlight, Input, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { username } from './context/details';

function App() {

	const [recGetUser, setRecGetUser] = useState('');
	const { socket } = useContext(SocketContext);

	const [data, setData] = useState('');

	const {
		isOpen: visibleAlert,
		onClose,
		onOpen
	} = useDisclosure({ defaultIsOpen: false });

	const handleUserAdded = useCallback((data: any) => {
		console.log('newAdded event::', data);
	}, [socket]);


	const handleSentUser = useCallback((data: any) => {
		console.log('sentUser event::', data)
		// alert(`Got user socket: ${data.socket}`)
		setData(data.socket);
		onOpen();
	},[socket,onOpen]);

	const handleGetUser = useCallback((userRec: any) => {
		socket.emit('getUser', { id: userRec })
	}, [socket]);

	useEffect(() => {
		// setUsername(generateUsername());
		socket.emit('addNew', { id: username });

		socket.on('newAdded', handleUserAdded);
		socket.on('sentUser', handleSentUser);

		return () => {
			socket.off('newAdded', handleUserAdded);
			socket.off('sentUser', handleSentUser);
		};
	}, [socket])

	return visibleAlert ?
		(
			<Alert
				status='success'
				variant='subtle'
				flexDirection='column'
				alignItems='center'
				justifyContent='center'
				textAlign='center'
				height='200px'
			>
				<CloseButton
					alignSelf='flex-end'
					position='relative'
					left={-1}
					top={-1}
					onClick={onClose}
				/>
				<AlertIcon />
				<Box>
					<AlertTitle mt={4} mb={1} fontSize='lg' >Success</AlertTitle>
					<AlertDescription maxWidth='sm'>
						{/* alert(`Got user socket: ${data.socket}`) */}
						Got the user details <br />
						User details for messaging: {data}
					</AlertDescription>
				</Box>
			</Alert>
		) : (
			<Center>
				<Container>
					<Stack>
						<Heading as='h1' size='2xl'>App Component</Heading>

						<HStack>
							<Heading as='h3' size='lg'>username:</Heading>
							{/* <Heading size='md'>  */}
							<Highlight query={'spotlight'}>{username}</Highlight>
							{/* </Heading> */}
						</HStack>

						<Stack>
							<Heading as='h3' size='md'>Get User Details</Heading>
							<HStack>
								<Input placeholder='receiver userame' variant='filled' shadow='xl' onChange={(e) => setRecGetUser(e.target.value)} />
								<Button type='button' shadow='xl' onClick={() => handleGetUser(recGetUser)}>Get Details</Button>
							</HStack>
						</Stack>

						<Details />
					</Stack>
				</Container>
			</Center>
		);
}

export default App;