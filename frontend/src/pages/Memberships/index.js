import React, { useState, useEffect } from 'react';

import { confirmAlert } from 'react-confirm-alert';
import { MdAdd, MdCheckCircle } from 'react-icons/md';
import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { toast } from 'react-toastify';

import Loading from '~/components/Loading';
import Pagination from '~/components/Pagination';
import api from '~/services/api';
import history from '~/services/history';

import { Container, MembershipList } from './styles';

export default function Memberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const textAlignStyle = {
    textAlign: 'center',
  };

  const loadMemberships = async () => {
    try {
      const { data } = await api.get('reports', {
        params: { page },
      });

      setTotalPages(Math.ceil(data.count / 10));
      setMemberships(
        data.reports.map(m => ({
          ...m,
          start_date: m.document
            ? format(parseISO(m.start_date), "d 'de' MMMM 'de' yyyy", {
                locale: pt,
              })
            : '',
          end_date: m.document
            ? format(parseISO(m.end_date), "d 'de' MMMM 'de' yyyy", {
                locale: pt,
              })
            : '',
          active: !m.document ? false : m.active,
        }))
      );
    } catch (err) {
      toast.error(
        (err.response && err.response.data.error) ||
          'Erro de comunicação com o servidor'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, [page]); //eslint-disable-line

  const handleEdit = (shopkeeperId) => {
    /* if (active) {
      toast.info('Matrículas ativas não podem ser alteradas');
      return;
    } */
    history.push(`memberships/${shopkeeperId}`);
  };

  const handleDelete = membership => {
    confirmAlert({
      title: 'Confirme a exclusão',
      message: `Deseja remover a vinculação do lojista ${membership.shopkeeper.employee} ?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await api.delete(`reports/${membership.shopkeeper_id}`);
              toast.success('Vinculação excluida com sucesso');
              setPage(memberships.length === 1 ? page - 1 : page);
              setMemberships(memberships.filter(m => m.id !== membership.id));
            } catch (err) {
              toast.error(
                (err.response && err.response.data.error) ||
                  'Erro de comunicação com o servidor'
              );
            }
          },
        },
        {
          label: 'No',
          onClick: () => '',
        },
      ],
    });
  };

  return (
    <Container>
      {loading ? (
        <Loading type="spinner" />
      ) : (
        <>
          <div>
            <h1>Vincular Laudo e Lojista</h1>
            <div>
              <button
                type="button"
                onClick={() => history.push('memberships/new')}
              >
                <MdAdd size={18} />
                <span>CADASTRAR</span>
              </button>
            </div>
          </div>
          {!memberships.length ? (
            <p>Nenhuma Vinculação encontrada...</p>
          ) : (
            <>
              <MembershipList>
                <li>
                  <strong>LOJISTA</strong>
                  <strong style={textAlignStyle}>CATEGORIA</strong>
                  <strong style={textAlignStyle}>INÍCIO</strong>
                  <strong style={textAlignStyle}>FIM DA VALIDADE</strong>
                  <strong style={textAlignStyle}>ATIVA</strong>
                </li>
                {memberships.map(membership => (
                  <li key={membership.id}>
                    <span>{membership.shopkeeper.employee}</span>
                    <span style={textAlignStyle}>
                      {membership.document ? membership.document.title : 'sem Laudo'}
                    </span>
                    <span style={textAlignStyle}>{membership.start_date} </span>
                    <span style={textAlignStyle}>{membership.end_date}</span>
                    <span style={textAlignStyle}>
                      <MdCheckCircle
                        size={18}
                        color={membership.active ? '#42cb59' : '#ddd'}
                      />
                    </span>
                    <div>
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(membership.shopkeeper_id)
                        }
                      >
                        editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(membership)}
                      >
                        apagar
                      </button>
                    </div>
                  </li>
                ))}
              </MembershipList>
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </>
          )}
        </>
      )}
    </Container>
  );
}
