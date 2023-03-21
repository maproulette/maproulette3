import React, { useEffect } from 'react'
import ReactTable from 'react-table-6'
import {
  injectIntl 
} from 'react-intl'
import { intlTableProps } from '../../components/IntlTable/IntlTable'
import { useSentComments } from './SentCommentsHooks';

const Sent = (props) => {
  const {
    comments,
    fetchComments
  } = useSentComments()

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-justify-center mr-items-center">
      <section className="mr-flex-grow mr-w-full mr-bg-black-15 mr-p-4 md:mr-p-8 mr-rounded">
        <div>header</div>

        <ReactTable
          data={comments}
          columns={[]}
          defaultPageSize={25}
          defaultSorted={[ {id: 'created', desc: true} ]}
          minRows={1}
          multiSort={false}
          noDataText={"no data"}
          loading={false}
          getTrProps={() => {
            const styles = {}
            return {style: styles}
          }}
          {...intlTableProps(props.intl)}
        >
          {(state, makeTable) => {
            return makeTable()
          }}
        </ReactTable>
      </section>

      {/* {openNotification &&
        <Notification
          notification={openNotification}
          thread={groupByTask ? threads[openNotification.taskId] : undefined}
          onClose={closeNotification}
          onDelete={deleteNotification}
        />
      } */}
    </div>
  )
}

export default injectIntl(Sent)
