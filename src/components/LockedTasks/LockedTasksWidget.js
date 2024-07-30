import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import _get from 'lodash/get';
import _isFinite from 'lodash/isFinite';
import { WidgetDataTarget, registerWidgetType } from '../../services/Widget/Widget';
import { fetchUsersLockedTasks } from '../../services/User/User';
import { Link } from 'react-router-dom';
import messages from './Messages';
import QuickWidget from '../QuickWidget/QuickWidget';
import SvgSymbol from '../SvgSymbol/SvgSymbol';
import Dropdown from '../Dropdown/Dropdown';
import WithLockedTask from '../HOCs/WithLockedTask/WithLockedTask';
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns';

const descriptor = {
  widgetKey: 'LockedTasksWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
};

const LockedTasks = (props) => {
  const [lockedTasks, setLockedTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  const calculateElapsedTime = (startDate) => {
    const timestamp = parseISO(startDate);
    const created = `${props.intl.formatDate(timestamp)} ${props.intl.formatTime(timestamp)}`;
    const distanceToNow = formatDistanceToNow(timestamp, { addSuffix: true });
    const minutesElapsed = differenceInMinutes(currentTime, timestamp);

    let timeColor = '';
    if (minutesElapsed > 60) {
      timeColor = 'mr-text-red';
    } else if (minutesElapsed > 30) {
      timeColor = 'mr-text-orange';
    }

    return (
      <div className={`mr-ml-1 ${timeColor}`} title={`${minutesElapsed} minutes since: ${created}`}>
        {distanceToNow}
      </div>
    );
  };

  const fetchLockedTasks = async () => {
    if (props.user) {
      const tasks = await fetchUsersLockedTasks(props.user.id);
      setLockedTasks(tasks);
    }
  };

  useEffect(() => {
    fetchLockedTasks();
  }, [props.user]);

  const LockedTasksList = () => {
    const sortedLockedTasks = [...lockedTasks].sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

    return sortedLockedTasks.length > 0 ? (
      <div className="mr-flex mr-flex-wrap mr-links-green-lighter">
        {sortedLockedTasks.map(task => {
          if (!_isFinite(_get(task, 'id'))) {
            return null;
          }

          return (
            <div key={task.id} className="mr-card-challenge mr-p-1 mr-mt-3 mr-mr-3 mr-w-full mr-flex mr-items-center" style={{maxWidth: '22rem'}}>
              <div className="mr-flex mr-flex-col mr-flex-grow">
                <div className="mr-flex">Started: {calculateElapsedTime(task.startedAt)}</div>
                <div>Task:
                  <Link to={`/challenge/${task.parent}/task/${task.id}`}>
                    {task.id}
                  </Link>
                </div>
                <div>Challenge: <Link to={`browse/challenges/${task.parent}`}>{task.parentName}</Link></div>
              </div>
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={dropdown => (
                  <button
                    onClick={dropdown.toggleDropdownVisible}
                    className="mr-flex mr-items-center mr-text-green-lighter mr-mr-4"
                  >
                    <SvgSymbol
                      sym="locked-icon"
                      viewBox="0 0 20 20"
                      className="mr-w-4 mr-h-4 mr-fill-current"
                    />
                  </button>
                )}
                dropdownContent={() => (
                  <div className="mr-links-green-lighter mr-text-sm mr-flex mr-items-center mr-mt-2">
                    <span className="mr-flex mr-items-baseline">
                      Task locked
                    </span>
                    <button
                      onClick={() => {
                        props.unlockTask(task);
                        setLockedTasks(prevTasks => prevTasks.filter(prevTask => prevTask.id !== task.id));
                      }}
                      className="mr-button mr-button--xsmall mr-ml-3"
                    >
                      Unlock
                    </button>
                  </div>
                )}
              />
            </div>
          );
        })}
      </div>
    ) : (
      <div className="mr-text-grey-lighter">
        <FormattedMessage {...messages.noLockedTasks} />
      </div>
    );
  };

  const LockedTasksListComponent = WithLockedTask(LockedTasksList);

  return (
    <QuickWidget
      {...props}
      className="locked-tasks-widget"
      widgetTitle={
        <div>
          <FormattedMessage {...messages.header} />
        </div>
      }
    >
      Tasks locked for more than an hour will be automatically unlocked within the next hour or might already be unlocked. <button className="mr-text-green-lighter" onClick={fetchLockedTasks}>Refresh list</button> to check.
      <LockedTasksListComponent {...props} />
    </QuickWidget>
  );
};

const LockedTasksWidget = WithLockedTask(LockedTasks);

registerWidgetType(LockedTasksWidget, descriptor);
export default LockedTasksWidget;
