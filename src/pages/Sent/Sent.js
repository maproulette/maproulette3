import React, { useEffect, useState } from 'react'
import ReactTable from 'react-table-6'
import { Link } from 'react-router-dom'
import { FormattedDate, FormattedTime, injectIntl } from 'react-intl'
import { intlTableProps } from '../../components/IntlTable/IntlTable'
import { useSentComments } from './SentCommentsHooks'
import WithCurrentUser from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import HeaderSent from './HeaderSent'
import Notification from './Notification'
import CommentType from '../../services/Comment/CommentType'

const defaultSorted = {
  id: 'created',
  desc: true,
}

const defaultPagination = {
  page: 0,
  pageSize: 25
}

const Sent = (props) => {
  const [commentType, setCommentType] = useState(CommentType.TASK);
  const comments = useSentComments(commentType);
  const [sortCriteria, setSortCriteria] = useState(defaultSorted);
  const [pagination, setPagination] = useState(defaultPagination);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    comments.fetch(props.user?.id, sortCriteria, pagination)
  }, [props.user?.id, commentType, sortCriteria.id, sortCriteria.desc, pagination.page, pagination.pageSize]);

  const resetTable = () => {
    setSortCriteria(defaultSorted);
    setPagination(defaultPagination);
  };

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-justify-center mr-items-center">
      <section className="mr-flex-grow mr-w-full mr-bg-black-15 mr-p-4 md:mr-p-8 mr-rounded">
        <HeaderSent
          commentType={commentType}
          refreshData={() => comments.fetch(props.user?.id, sortCriteria, pagination)}
          setCommentType={(t) => {
            setCommentType(t);
            resetTable();
          }}
        />
        <ReactTable
          data={comments.data}
          columns={commentType === CommentType.TASK ? taskColumns({ setSelectedComment }) : challengeColumns({ setSelectedComment })}
          defaultPageSize={defaultPagination.pageSize}
          defaultSorted={[defaultSorted]}
          minRows={1}
          manual
          sorted={[sortCriteria]}
          multiSort={false}
          noDataText={"no data"}
          loading={comments.loading}
          pageSize={pagination.pageSize}
          pages={Math.ceil(comments.count / pagination.pageSize)}
          onSortedChange={(criteria) => { setSortCriteria(criteria[0])}}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onPageSizeChange={(pageSize) => setPagination({ ...pagination, pageSize })}
          page={pagination.page}
          getTrProps={() => {
            const styles = {}
            return { style: styles }
          }}
          {...intlTableProps(props.intl)}
        >
          {(state, makeTable) => {
            return makeTable()
          }}
        </ReactTable>
      </section>

      {selectedComment &&
        <Notification onClose={() => setSelectedComment(null)} id={selectedComment.id} text={selectedComment.text} type={selectedComment.type} />
      }
    </div>
  )
}

const taskColumns = ({ setSelectedComment }) => [{
  id: 'task_id',
  Header: 'Task ID',
  accessor: 'taskId',
  Cell: ({value}) => (
    <Link to={`task/${value}`} target="_blank" rel="noopener noreferrer">{value}</Link>
  ),
  maxWidth: 100,
  sortable: true,
  resizable: false
},{
  id: 'created',
  Header: 'Date',
  accessor: 'created',
  Cell: ({value}) => (
    <><FormattedDate value={value} /> <FormattedTime value={value} /></>
  ),
  maxWidth: 200,
  sortable: true,
  resizable: false
},{
  id: 'comment',
  Header: 'Comment',
  accessor: 'comment',
  Cell: ({ value, row }) => {
    return <Link onClick={() => setSelectedComment({ id: row.id, text: value, type: CommentType.TASK })} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{value}</Link>
  },
  sortable: true,
  resizable: false
}]

const challengeColumns = ({ setSelectedComment }) => [{
  id: 'challenge_name',
  Header: 'Challenge',
  accessor: 'challengeName',
  Cell: ({ value, original }) => {
    return <Link to={`browse/challenges/${original.challengeId}?tab=conversation`} target="_blank" rel="noopener noreferrer">{value}</Link>
  },
  maxWidth: 200,
  sortable: true,
  resizable: false
},{
  id: 'created',
  Header: 'Date',
  accessor: 'created',
  Cell: ({value}) => (
    <><FormattedDate value={value} /> <FormattedTime value={value} /></>
  ),
  maxWidth: 200,
  sortable: true,
  resizable: false
},{
  id: 'comment',
  Header: 'Comment',
  accessor: 'comment',
  Cell: ({ value, original }) => {
    return <Link onClick={() => setSelectedComment({ id: original.challengeId, text: value, type: CommentType.CHALLENGE })} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{value}</Link>
  },
  sortable: true,
  resizable: false
}]

export default injectIntl(WithCurrentUser(Sent))

