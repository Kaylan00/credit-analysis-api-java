package br.com.serasa.creditanalysis.exception;

public class DuplicateCpfException extends RuntimeException {
    public DuplicateCpfException(String cpf) {
        super("A proposal already exists for CPF: " + cpf);
    }
}