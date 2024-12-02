import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, TextInput, Dropdown, Badge } from 'flowbite-react';
import { Tabs } from 'flowbite-react';
import { HiSearch, HiFilter, HiSortAscending, HiSortDescending, HiClipboardList, HiLockOpen, HiLockClosed } from 'react-icons/hi';

const TasksList = () => {
  const [tasksData, setTasksData] = useState({ openTasks: [], closedTasks: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/admin/getAllTask');
      setTasksData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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

  const handleFilter = (type) => {
    setFilterType(type);
  };

  const filteredTasks = [...tasksData.openTasks, ...tasksData.closedTasks].filter(task =>
    (activeTab === 'all' || (activeTab === 'open' && task.task_flag === 'Open') || (activeTab === 'closed' && task.task_flag === 'Closed')) &&
    (task.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === '' || task.type === filterType)
  ).sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const taskTypes = [...new Set([...tasksData.openTasks, ...tasksData.closedTasks].map(task => task.type))];

  const TaskStatCard = ({ title, count, icon }) => (
    <Card>
      <div className="flex items-center">
        {icon}
        <div className="ml-4">
          <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{count}</h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </Card>
  );

  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TaskStatCard title="Total Tasks" count={tasksData.openTasks.length + tasksData.closedTasks.length} icon={<HiClipboardList className="w-10 h-10 text-blue-500" />} />
        <TaskStatCard title="Open Tasks" count={tasksData.openTasks.length} icon={<HiLockOpen className="w-10 h-10 text-green-500" />} />
        <TaskStatCard title="Closed Tasks" count={tasksData.closedTasks.length} icon={<HiLockClosed className="w-10 h-10 text-red-500" />} />
      </div>

      <Card>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <TextInput
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearch}
            icon={HiSearch}
            className="w-full md:w-1/3"
          />
          <div className="flex space-x-2">
            <Dropdown label="Filter by Type" icon={HiFilter} color="light">
              <Dropdown.Item onClick={() => handleFilter('')}>All Types</Dropdown.Item>
              {taskTypes.map((type) => (
                <Dropdown.Item key={type} onClick={() => handleFilter(type)}>{type}</Dropdown.Item>
              ))}
            </Dropdown>
          </div>
        </div>

        <Tabs
          aria-label="Task tabs"
          style={{ borderColor: "blue" }}
          onActiveTabChange={(tab) => setActiveTab(['all', 'open', 'closed'][tab])}
        >
          <Tabs.Item active title="All Tasks" icon={HiClipboardList}>
            <TaskTable tasks={filteredTasks} handleSort={handleSort} sortField={sortField} sortOrder={sortOrder} />
          </Tabs.Item>
          <Tabs.Item title="Open Tasks" icon={HiLockOpen}>
            <TaskTable tasks={filteredTasks.filter(task => task.task_flag === 'Open')} handleSort={handleSort} sortField={sortField} sortOrder={sortOrder} />
          </Tabs.Item>
          <Tabs.Item title="Closed Tasks" icon={HiLockClosed}>
            <TaskTable tasks={filteredTasks.filter(task => task.task_flag === 'Closed')} handleSort={handleSort} sortField={sortField} sortOrder={sortOrder} />
          </Tabs.Item>
        </Tabs>
      </Card>
    </div>
  );
};

const TaskTable = ({ tasks, handleSort, sortField, sortOrder }) => (
  <Table hoverable>
    <Table.Head>
      <Table.HeadCell className="cursor-pointer" onClick={() => handleSort('heading')}>
        Task Name {sortField === 'heading' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
      </Table.HeadCell>
      <Table.HeadCell className="cursor-pointer" onClick={() => handleSort('type')}>
        Type {sortField === 'type' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
      </Table.HeadCell>
      <Table.HeadCell className="cursor-pointer" onClick={() => handleSort('creator')}>
        Creator {sortField === 'creator' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
      </Table.HeadCell>
      <Table.HeadCell className="cursor-pointer" onClick={() => handleSort('post_date')}>
        Post Date {sortField === 'post_date' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
      </Table.HeadCell>
      <Table.HeadCell className="cursor-pointer" onClick={() => handleSort('end_date')}>
        End Date {sortField === 'end_date' && (sortOrder === 'asc' ? <HiSortAscending className="inline" /> : <HiSortDescending className="inline" />)}
      </Table.HeadCell>
      <Table.HeadCell>Status</Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
      {tasks.map((task) => (
        <Table.Row key={task._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
          <Table.Cell className="font-medium text-gray-900 dark:text-white">
            {task.heading}
          </Table.Cell>
          <Table.Cell>{task.type}</Table.Cell>
          <Table.Cell>{task.creator}</Table.Cell>
          <Table.Cell>{new Date(task.post_date).toLocaleDateString()}</Table.Cell>
          <Table.Cell>{new Date(task.end_date).toLocaleDateString()}</Table.Cell>
          <Table.Cell>
            <Badge color={task.task_flag === 'Open' ? 'success' : 'failure'}>
              {task.task_flag}
            </Badge>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

export default TasksList;