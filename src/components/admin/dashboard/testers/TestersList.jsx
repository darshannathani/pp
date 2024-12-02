import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TextInput, Dropdown, Badge } from 'flowbite-react';
import { HiSearch, HiFilter, HiSortAscending, HiSortDescending } from 'react-icons/hi';

const TestersList = () => {
  const [testers, setTesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCountry, setFilterCountry] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    fetchTesters();
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, sortField, sortOrder, filterCountry]);

  const fetchTesters = async () => {
    try {
      const response = await axios.get('/api/admin/getAllTester');
      setTesters(response.data.testers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching testers:', error);
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilter = (country) => {
    setFilterCountry(country);
  };

  const filteredTesters = testers
    .filter((tester) =>
      tester.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tester.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tester.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((tester) => filterCountry === '' || tester.country === filterCountry)
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const uniqueCountries = [...new Set(testers.map((tester) => tester.country))];

  const SkeletonRow = () => (
    <Table.Row className="bg-white animate-pulse">
      <Table.Cell className="py-4"><div className="w-3/4 h-4 bg-gray-200 rounded"></div></Table.Cell>
      <Table.Cell><div className="h-4 bg-gray-200 rounded"></div></Table.Cell>
      <Table.Cell><div className="w-1/2 h-4 bg-gray-200 rounded"></div></Table.Cell>
      <Table.Cell><div className="w-1/4 h-4 bg-gray-200 rounded"></div></Table.Cell>
      <Table.Cell><div className="w-1/4 h-4 bg-gray-200 rounded"></div></Table.Cell>
    </Table.Row>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Testers List</h1>
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center w-full md:w-auto">
          <TextInput
            type="text"
            placeholder="Search testers..."
            value={searchTerm}
            onChange={handleSearch}
            icon={HiSearch}
            className="w-full md:w-64"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Dropdown label="Filter by Country" icon={HiFilter} color="blue">
            <Dropdown.Item onClick={() => handleFilter('')}>All Countries</Dropdown.Item>
            {uniqueCountries.map((country) => (
              <Dropdown.Item key={country} onClick={() => handleFilter(country)}>
                {country}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      </div>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell onClick={() => handleSort('firstName')} className="cursor-pointer">
            Name {sortField === 'firstName' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
          </Table.HeadCell>
          <Table.HeadCell onClick={() => handleSort('email')} className="cursor-pointer">
            Email {sortField === 'email' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
          </Table.HeadCell>
          <Table.HeadCell onClick={() => handleSort('country')} className="cursor-pointer">
            Country {sortField === 'country' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
          </Table.HeadCell>
          <Table.HeadCell onClick={() => handleSort('taskHistory.length')} className="cursor-pointer">
            Tasks Completed {sortField === 'taskHistory.length' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
          </Table.HeadCell>
          <Table.HeadCell>
            Status
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {loading || isFiltering ? (
            Array(5).fill(0).map((_, index) => <SkeletonRow key={index} />)
          ) : (
            filteredTesters.map((tester) => (
              <Table.Row key={tester._id} className="bg-white hover:bg-gray-50">
                <Table.Cell className="font-medium text-gray-900">
                  {tester.firstName} {tester.lastName}
                </Table.Cell>
                <Table.Cell>{tester.email}</Table.Cell>
                <Table.Cell>{tester.country}</Table.Cell>
                <Table.Cell>{tester.taskHistory.filter(task => task.status === 'success').length}</Table.Cell>
                <Table.Cell>
                  <Badge color={tester.taskHistory.length > 0 ? 'success' : 'warning'}>
                    {tester.taskHistory.length > 0 ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default TestersList;