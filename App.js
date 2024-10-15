import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FaRegCircle, FaRegCheckCircle, FaCircle, FaExclamation, FaRegDotCircle, FaBan } from 'react-icons/fa';
import { ReactComponent as AddIcon } from './icons_FEtask/add.svg';
import { ReactComponent as MenuIcon } from './icons_FEtask/3 dot menu.svg';
import { ReactComponent as NoPriorityIcon } from './icons_FEtask/No-priority.svg';
import { ReactComponent as LowPriorityIcon } from './icons_FEtask/Img - Low Priority.svg';
import { ReactComponent as MediumPriorityIcon } from './icons_FEtask/Img - Medium Priority.svg';
import { ReactComponent as HighPriorityIcon } from './icons_FEtask/Img - High Priority.svg';
import { ReactComponent as UrgentPriorityIcon } from './icons_FEtask/SVG - Urgent Priority colour.svg';
import { ReactComponent as displayIcon } from './icons_FEtask/Display.svg';


const App = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState(localStorage.getItem("groupBy") || "status");
  const [sortBy, setSortBy] = useState(localStorage.getItem("sortBy") || "priority");
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("https://api.quicksell.co/v1/internal/frontend-assignment");
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("groupBy", groupBy);
    localStorage.setItem("sortBy", sortBy);
  }, [groupBy, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getGroupedTickets = () => {
    let groups = {};
    if (groupBy === "status") {
      groups = { "Backlog": [], "Todo": [], "In progress": [], "Done": [], "Cancelled": [] };
    } else if (groupBy === "user") {
      users.forEach(user => groups[user.name] = []);
    } else if (groupBy === "priority") {
      groups = { "No priority": [], "Low": [], "Medium": [], "High": [], "Urgent": [] };
    }

    tickets.forEach(ticket => {
      if (groupBy === "status") {
        groups[ticket.status] ? groups[ticket.status].push(ticket) : groups["Cancelled"].push(ticket);
      } else if (groupBy === "user") {
        const user = users.find(u => u.id === ticket.userId);
        if (user) groups[user.name].push(ticket);
      } else if (groupBy === "priority") {
        const priorityName = ["No priority", "Low", "Medium", "High", "Urgent"][ticket.priority];
        groups[priorityName].push(ticket);
      }
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        if (sortBy === "priority") return b.priority - a.priority;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
    });

    return groups;
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case "Urgent": return <UrgentPriorityIcon className="priority-icon urgent" />;
      case "High": return <HighPriorityIcon className="priority-icon high" />;
      case "Medium": return <MediumPriorityIcon className="priority-icon medium" />;
      case "Low": return <LowPriorityIcon className="priority-icon low" />;
      default: return <NoPriorityIcon className="priority-icon no-priority" />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Done": return <FaRegCheckCircle className="status-icon done" />;
      case "In progress": return <FaRegDotCircle className="status-icon in-progress" />;
      case "Todo": return <FaRegCircle className="status-icon todo" />;
      case "Cancelled": return <FaBan className="status-icon cancelled" />;
      default: return <FaRegCircle className="status-icon backlog" />;
    }
  };

  return (
    <div className="app">
      <header>
        <div 
          className="display-button" 
          onClick={() => setShowOptions(!showOptions)}
          onMouseEnter={() => setShowOptions(true)}
          style={{ width: '70px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
           {/* Use the SVG just like other icons */}
        <svg className="icon">
          <use xlinkHref={`${process.env.PUBLIC_URL}./src/icons_FEtask/Display.svg#icon`} />
        </svg>
        <span style={{ marginLeft: '5px' }}>Display</span>

          <span className="icon">▼</span>
        </div>
        {showOptions && (
          <div className="options-menu" ref={optionsRef}>
            <div className="option">
              <label>Grouping</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="option">
              <label>Ordering</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </header>
      <main>
      <div className="kanban-board">
          {Object.entries(getGroupedTickets()).map(([group, tickets]) => (
            <div key={group} className="column">
              <h2>
                {groupBy === "priority" ? getPriorityIcon(group) : getStatusIcon(group)}
                <span className="group-title">{group}</span> <span className="ticket-count">{tickets.length}</span>
                <div className="icon-container">
                  <AddIcon className="icon add-icon" />
                  <MenuIcon className="icon menu-icon" />
                </div>
              </h2>
              {tickets.map(ticket => (
                <div key={ticket.id} className="card">
                  <div className="card-header">
                    <span className="ticket-id">{ticket.id}</span>
                    <span className="user-avatar">
                      {users.find(u => u.id === ticket.userId)?.name.charAt(0)}
                    </span>
                  </div>
                  <h3>{ticket.title}</h3>
                  
                  <div className="card-footer">
  <span className="priority-indicator">
    {getPriorityIcon(["No priority", "Low", "Medium", "High", "Urgent"][ticket.priority])}
  </span>
  {ticket.tag[0] === 'Feature Request' && (
    <div className="feature-request">
      <span className="dot"></span>
      Feature Request
    </div>
  )}
</div>

                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;