import React, { useEffect, useState, useContext } from 'react';
import {
    Box,
    Heading,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Text,
    Tooltip,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { UserContext } from '../userContext'; // Import your UserContext
import { User } from '../interfaces/User';
import { API_URL } from '../config';

const PenalUsers: React.FC = () => {
    const { user } = useContext(UserContext); // Access the logged-in user's role
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            return; // Do not fetch data if user is not an admin
        }

        setLoading(true);
        fetch(`${API_URL}/user`)
            .then((response) => response.json())
            .then((data) => {
                // Sort users by the number of reports in descending order
                const sortedUsers = data.sort(
                    (a: User, b: User) => b.userReports.length - a.userReports.length
                );
                setUsers(sortedUsers);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                setLoading(false);
            });
    }, [user]);

    const toggleBanUser = async (userId: string, isBanned: boolean) => {
        try {
            const response = await fetch(`${API_URL}/user/ban/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ isBanned: !isBanned }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to update ban status');
            }

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, isBanned: !isBanned } : user
                )
            );
        } catch (error) {
            console.error('Error updating ban status:', error);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <Box p={6} maxW="container.md" mx="auto" textAlign="center">
                <Heading as="h2" size="lg" color="red.500">
                    Dostop zavrnjen
                </Heading>
                <Text mt={4} fontSize="md" color="gray.700">
                    Nimate dovoljenja za ogled te strani. Prosimo, obrnite se na skrbnika.
                </Text>
            </Box>
        );
    }

    if (loading) {
        return <Spinner size="xl" />;
    }

    return (
        <Box p={6} maxW="container.xlg" mx="auto" borderWidth="1px" borderRadius="lg" shadow="lg">
            <Heading as="h2" size="xl" mb={6} textAlign="center" color="teal.600">
                Uporabniki s Prijavami
            </Heading>

            {users.length > 0 ? (
                <Box overflowX="auto" p={6}>
                    <Table variant="striped" colorScheme="teal">
                        <Thead>
                            <Tr>
                                <Th>Uporabniško ime</Th>
                                <Th>Email</Th>
                                <Th>Število prijav</Th>
                                <Th>Razlogi za prijavo</Th>
                                <Th>Status</Th>
                                <Th>Akcije</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map((user) => (
                                <Tr key={user._id}>
                                    <Td>{user.username}</Td>
                                    <Td>{user.email}</Td>
                                    <Td>{user.userReports.length}</Td>
                                    <Td>
                                        {user.userReports.length > 0 ? (
                                            <Tooltip
                                                label={user.userReports
                                                    .slice(0, 5) // Show first 5 reasons in tooltip
                                                    .map((report) => `• ${report.reportReason}`)
                                                    .join('\n')}
                                                fontSize="md"
                                                hasArrow
                                                placement="top"
                                            >
                                                <Text>
                                                    {user.userReports.slice(0, 2).map((report) => (
                                                        <Text key={report.reportingUserId} isTruncated>
                                                            {report.reportReason}
                                                        </Text>
                                                    ))}
                                                    {user.userReports.length > 2 && (
                                                        <Text as="i" color="gray.500">
                                                            in še {user.userReports.length - 2} razlogov...
                                                        </Text>
                                                    )}
                                                </Text>
                                            </Tooltip>
                                        ) : (
                                            <Text color="gray.500">Ni prijav</Text>
                                        )}
                                    </Td>
                                    <Td>
                                        <Text color={user.isBanned ? 'red.500' : 'green.500'}>
                                            {user.isBanned ? 'Blokiran' : 'Aktiven'}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Link to={`/user/${user._id}`}>
                                            <Button colorScheme="teal" mb={2} size="sm">
                                                Ogled profila
                                            </Button>
                                        </Link>
                                        <br />
                                        <Button
                                            colorScheme={user.isBanned ? 'green' : 'red'}
                                            size="sm"
                                            onClick={() => toggleBanUser(user._id, user.isBanned)}
                                        >
                                            {user.isBanned ? 'Odblokiraj' : 'Blokiraj'}
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            ) : (
                <Text color="gray.500" textAlign="center">
                    Trenutno ni uporabnikov z prijavami.
                </Text>
            )}
        </Box>
    );
};

export default PenalUsers;
